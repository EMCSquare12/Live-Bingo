// server/gameManager.js
const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

class Game {
  constructor(io, roomCode, hostSocketId, hostName, cardNumber, winningPattern, theme) {
    this.io = io;
    this.roomCode = roomCode;
    this.hostId = uuidv4();
    this.hostSocketId = hostSocketId;
    this.hostName = hostName;
    this.cardNumber = cardNumber;
    this.cardWinningPattern = winningPattern;
    this.theme = theme;
    
    this.players = [];
    this.numberCalled = [null]; // Free space is effectively null
    this.winners = [];
    this.isShuffling = false;
    this.disconnectTimeouts = new Map(); // Map<socketId, timeoutId>
  }

  calculateBestCardResult(cards, markedNumbers = []) {
    if (!cards || cards.length === 0 || !this.cardWinningPattern?.index) return [];

    const winningIndices = this.cardWinningPattern.index;
    const markedSet = new Set(markedNumbers);
    let bestResult = null;
    let minRemaining = Infinity;

    for (const card of cards) {
      const cardNumbers = [...card.B, ...card.I, ...card.N, ...card.G, ...card.O];
      
      const requiredNumbers = winningIndices
        .map((idx) => cardNumbers[idx])
        .filter((num) => num !== null); // Ignore free space

      const remaining = requiredNumbers.filter((num) => !markedSet.has(num));

      if (remaining.length < minRemaining) {
        minRemaining = remaining.length;
        bestResult = remaining;
      }
    }
    return bestResult || [];
  }

  addPlayer(socketId, name) {
    const existing = this.players.find(p => p.socketId === socketId);
    if (existing) return existing;

    const cards = Array.from({ length: this.cardNumber }, generateCard);
    const player = {
      id: uuidv4(),
      socketId,
      name,
      cards,
      markedNumbers: [],
      result: this.calculateBestCardResult(cards, []),
      connected: true,
    };
    this.players.push(player);
    return player;
  }

  removePlayer(socketId) {
    const idx = this.players.findIndex(p => p.socketId === socketId);
    if (idx !== -1) {
      const removed = this.players.splice(idx, 1)[0];
      return removed;
    }
    return null;
  }

  reconnectPlayer(persistentId, newSocketId) {
    const player = this.players.find(p => p.id === persistentId);
    if (player) {
      // Clear any pending disconnect timeout
      if (this.disconnectTimeouts.has(player.socketId)) {
        clearTimeout(this.disconnectTimeouts.get(player.socketId));
        this.disconnectTimeouts.delete(player.socketId);
      }
      player.socketId = newSocketId;
      player.connected = true;
      return player;
    }
    return null;
  }

  reconnectHost(persistentId, newSocketId) {
    if (this.hostId === persistentId) {
       // Clear any pending disconnect timeout
       if (this.disconnectTimeouts.has(this.hostSocketId)) {
        clearTimeout(this.disconnectTimeouts.get(this.hostSocketId));
        this.disconnectTimeouts.delete(this.hostSocketId);
      }
      this.hostSocketId = newSocketId;
      return true;
    }
    return false;
  }

  markNumbers(playerId, numbers) {
    const player = this.players.find(p => p.id === playerId);
    if (!player) return;

    // Sanitize: only allow numbers that have been called
    const validNumbers = numbers.filter(n => n === null || this.numberCalled.includes(n));
    player.markedNumbers = validNumbers;
    player.result = this.calculateBestCardResult(player.cards, validNumbers);

    this.checkWinCondition(player);
  }

  checkWinCondition(player) {
    const winningIndices = this.cardWinningPattern.index;
    const hasWon = player.cards.some(card => {
      const cardNumbers = [...card.B, ...card.I, ...card.N, ...card.G, ...card.O];
      const required = winningIndices.map(idx => cardNumbers[idx]).filter(n => n !== null);
      return required.length > 0 && required.every(req => player.markedNumbers.includes(req));
    });

    if (hasWon) {
      const alreadyWinner = this.winners.some(w => w.id === player.id);
      if (!alreadyWinner) {
        this.winners.push({ id: player.id, name: player.name });
        this.io.to(this.roomCode).emit("players-won", this.winners);
      }
    }
  }

  rollNumber(socket) {
    if (this.hostSocketId !== socket.id || this.winners.length > 0 || this.isShuffling) return;

    this.isShuffling = true;
    
    // Animation loop
    const interval = setInterval(() => {
        const rand = Math.floor(Math.random() * 75) + 1;
        this.io.to(this.roomCode).emit("shuffling", rand);
    }, 60);

    setTimeout(() => {
        clearInterval(interval);
        this.isShuffling = false;
        
        const available = Array.from({ length: 75 }, (_, i) => i + 1).filter(n => !this.numberCalled.includes(n));
        if (available.length > 0) {
            const nextNum = available[Math.floor(Math.random() * available.length)];
            this.numberCalled.push(nextNum);
            this.io.to(this.roomCode).emit("number-called", this.numberCalled);
        }
    }, 1500);
  }

  resetGame() {
    this.numberCalled = [null];
    this.winners = [];
    this.isShuffling = false;
    this.players.forEach(p => {
        p.markedNumbers = [];
        p.result = this.calculateBestCardResult(p.cards, []);
    });
  }

  getPublicState() {
    return {
        hostName: this.hostName,
        hostId: this.hostId, // Needed for session validation
        cardNumber: this.cardNumber,
        cardWinningPattern: this.cardWinningPattern,
        numberCalled: this.numberCalled,
        players: this.players,
        winners: this.winners,
        theme: this.theme
    };
  }
}

// Global Store
const games = new Map();

// --- Exported Helper Functions mapped to Socket Events ---

function createRoom(io, socket, hostName, cardNumber, winningPattern, theme) {
    const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
    const game = new Game(io, roomCode, socket.id, hostName, cardNumber, winningPattern, theme);
    games.set(roomCode, game);
    
    socket.join(roomCode);
    socket.emit("room-created", roomCode, game.hostId);
    console.log(`[Game] Room created: ${roomCode}`);
}

function joinRoom(io, socket, playerName, roomCode) {
    const game = games.get(roomCode);
    if (!game) return socket.emit("room-not-found", "Room does not exist.");
    if (game.numberCalled.length > 1) return socket.emit("game-started", "Game already in progress.");

    const player = game.addPlayer(socket.id, playerName);
    socket.join(roomCode);
    
    // Emit full state to the joiner, but update everyone else on player list
    socket.emit("joined-room", roomCode, { ...game.getPublicState(), newPlayer: player });
    io.to(roomCode).emit("players", game.players);
}

function reconnectPlayer(io, socket, roomCode, persistentId, isHost) {
    const game = games.get(roomCode);
    if (!game) return socket.emit("reconnect-failed", "Room expired or not found");

    socket.join(roomCode);
    
    if (isHost) {
        if (game.reconnectHost(persistentId, socket.id)) {
            socket.emit("session-reconnected", { ...game.getPublicState(), roomCode });
        } else {
            socket.emit("reconnect-failed", "Invalid Host Session");
        }
    } else {
        const player = game.reconnectPlayer(persistentId, socket.id);
        if (player) {
            socket.emit("session-reconnected", { ...game.getPublicState(), roomCode });
            io.to(roomCode).emit("players", game.players);
        } else {
            socket.emit("reconnect-failed", "Player not found");
        }
    }
}

function handleDisconnect(io, socket) {
    for (const [code, game] of games.entries()) {
        // Host Disconnect Logic
        if (game.hostSocketId === socket.id) {
            // Set a timeout to destroy the room if host doesn't return
            const timer = setTimeout(() => {
                if (games.has(code) && games.get(code).hostSocketId === socket.id) {
                    endGame(io, code);
                }
            }, 86400000); // 24 hours
            game.disconnectTimeouts.set(socket.id, timer);
            return;
        }

        // Player Disconnect Logic
        const player = game.players.find(p => p.socketId === socket.id);
        if (player) {
            player.connected = false;
            io.to(code).emit("players", game.players);
            
            const timer = setTimeout(() => {
                // If still disconnected, remove player
                if (games.has(code)) {
                    const currentP = games.get(code).players.find(p => p.id === player.id);
                    if (currentP && !currentP.connected) {
                        game.removePlayer(socket.id);
                        io.to(code).emit("players", game.players);
                    }
                }
            }, 3600000); // 1 hour grace period
            game.disconnectTimeouts.set(socket.id, timer);
            return;
        }
    }
}

function endGame(io, roomCode) {
    if (games.has(roomCode)) {
        io.to(roomCode).emit("host-left");
        io.in(roomCode).disconnectSockets();
        games.delete(roomCode);
        console.log(`[Game] Room ${roomCode} destroyed.`);
    }
}

function requestNewNumber(io, socket, roomCode) {
    const game = games.get(roomCode);
    if(game) game.rollNumber(socket);
}

function markNumber(io, roomCode, playerId, markedNumbers) {
    const game = games.get(roomCode);
    if(game) {
        game.markNumbers(playerId, markedNumbers);
        io.to(roomCode).emit("players", game.players);
    }
}

function newGame(io, socket, roomCode) {
    const game = games.get(roomCode);
    if(game && game.hostSocketId === socket.id) {
        game.resetGame();
        io.to(roomCode).emit("game-reset", game.getPublicState());
    }
}

function updateTheme(io, roomCode, newTheme) {
    const game = games.get(roomCode);
    if(game) {
        game.theme = newTheme;
        io.to(roomCode).emit("theme-updated", newTheme);
    }
}

function updateWinningPattern(io, socket, roomCode, newPattern) {
    const game = games.get(roomCode);
    if (game && game.hostSocketId === socket.id) {
        game.cardWinningPattern = newPattern;
        // Recalculate results for all players
        game.players.forEach(p => {
            p.result = game.calculateBestCardResult(p.cards, p.markedNumbers);
        });
        io.to(roomCode).emit("winning-pattern-updated", newPattern);
        io.to(roomCode).emit("players", game.players);
    }
}

function refreshCard(io, socket, roomCode, playerId, cardIndex) {
    const game = games.get(roomCode);
    if (!game || game.numberCalled.length > 1) return; // Cant refresh if game started

    const player = game.players.find(p => p.id === playerId);
    if (player) {
        player.cards[cardIndex] = generateCard();
        player.result = game.calculateBestCardResult(player.cards, player.markedNumbers);
        socket.emit("card-refreshed", player.cards);
        io.to(roomCode).emit("players", game.players);
    }
}

function leaveGame(io, socket) {
    // Helper to find room by socket if roomCode isn't sent
    for (const [code, game] of games.entries()) {
        const player = game.removePlayer(socket.id);
        if(player) {
            io.to(code).emit("player-left", player.name);
            io.to(code).emit("players", game.players);
            socket.leave(code);
            socket.emit("leave-acknowledged");
            break;
        }
    }
}

module.exports = {
    createRoom,
    joinRoom,
    reconnectPlayer,
    handleDisconnect,
    requestNewNumber,
    markNumber,
    newGame,
    endGame,
    leaveGame,
    updateTheme,
    updateWinningPattern,
    refreshCard
};  