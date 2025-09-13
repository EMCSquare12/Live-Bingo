const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

let games = {}; // All active games stored in memory

function createRoom(io, socket, hostName, cardNumber, cardWinningPattern) {
  const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
  const hostId = uuidv4();

  games[roomCode] = {
    hostName,
    hostId,
    hostSocketId: socket.id,
    hostConnected: true,
    cardNumber,
    cardWinningPattern,
    numberCalled: [],
    players: [],
    winner: null,
    isNewRoundStarting: false,
  };

  socket.join(roomCode);
  socket.emit("room-created", roomCode, hostId);
  console.log(`🎲 Room created: ${roomCode}`);
}

function joinRoom(io, socket, playerName, roomCode) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("error", "Room does not exist");
    return;
  }

  const cards = Array.from({ length: game.cardNumber }, generateCard);
  const playerId = uuidv4();
  const player = { id: playerId, socketId: socket.id, name: playerName, cards, result: [], connected: true };

  game.players.push(player);

  socket.join(roomCode);
  socket.emit("joined-room", roomCode, player);

  if (game.hostSocketId) {
    io.to(game.hostSocketId).emit("players", game.players);
  }
}

function reconnectPlayer(io, socket, roomCode, persistentId, isHost) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("reconnect-failed", "Room not found");
    return;
  }

  socket.join(roomCode);

  if (isHost && game.hostId === persistentId) {
    console.log(`Host ${game.hostName} reconnected. New socket ID: ${socket.id}`);
    game.hostSocketId = socket.id;
    game.hostConnected = true;
  } else if (!isHost) {
    const player = game.players.find((p) => p.id === persistentId);
    if (player) {
      console.log(`Player ${player.name} reconnected. New socket ID: ${socket.id}`);
      player.socketId = socket.id;
      player.connected = true;
    } else {
      socket.emit("reconnect-failed", "Player not found");
      return;
    }
  } else {
    socket.emit("reconnect-failed", "Authorization error");
    return;
  }

  socket.emit("session-reconnected", { ...game, roomCode });

  if (game.hostSocketId) {
    io.to(game.hostSocketId).emit("players", game.players);
  }
}

function leaveGame(io, socket) {
    for (const [roomCode, game] of Object.entries(games)) {
      const playerIndex = game.players.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const removedPlayer = game.players.splice(playerIndex, 1)[0];
        console.log(`Player ${removedPlayer.name} intentionally left room ${roomCode}.`);
        
        if (game.hostSocketId && game.hostConnected) {
          io.to(game.hostSocketId).emit("players", game.players);
        }
        break;
      }
    }
}

function handleDisconnect(io, socket) {
  console.log(`❌ Client disconnected: ${socket.id}`);

  for (const game of Object.values(games)) {
    if (game.hostSocketId === socket.id) {
      console.log(`Host of room ${game.hostId} disconnected.`);
      game.hostConnected = false;
      break;
    }

    const playerIndex = game.players.findIndex((p) => p.socketId === socket.id);
    if (playerIndex !== -1) {
        const player = game.players[playerIndex];
        console.log(`Player ${player.name} temporarily disconnected.`);
        player.connected = false;
        if (game.hostSocketId && game.hostConnected) {
            io.to(game.hostSocketId).emit("players", game.players);
        }
        break;
    }
  }
}

function newGame(io, socket, roomCode) {
  const game = games[roomCode];
  if (!game || game.hostSocketId !== socket.id) {
    return;
  }

  console.log(`✨ Starting a new game in room ${roomCode}`);

  game.isNewRoundStarting = true;
  game.numberCalled = [];
  game.winner = null;

  game.players.forEach(player => {
    if (player.cards.length > 0) {
        const allNumbersOnCard = Object.values(player.cards[0]).flat();
        player.result = allNumbersOnCard;
    } else {
        player.result = [];
    }
  });

  io.to(roomCode).emit("game-reset", game);

  setTimeout(() => {
    if (games[roomCode]) {
      games[roomCode].isNewRoundStarting = false;
    }
  }, 5000);
}

function rollNumber(io, socket, numberCalled, roomCode) {
  const game = games[roomCode];
  if (!game || !numberCalled || game.winner || game.isNewRoundStarting || game.players.length < 2) {
    console.log("Roll blocked. Conditions not met.");
    return;
  }

  if (!game.numberCalled.includes(numberCalled)) {
    game.numberCalled.push(numberCalled);
  }

  const winningPatternIndices = game.cardWinningPattern.index;

  for (const player of game.players) {
    for (const card of player.cards) {
      const cardNumbers = [...card.B, ...card.I, ...card.N, ...card.G, ...card.O];
      const requiredNumbers = winningPatternIndices.map(index => cardNumbers[index]);
      const isWinner = requiredNumbers.every(num => game.numberCalled.includes(num));

      if (isWinner) {
        game.winner = { id: player.id, name: player.name };
        console.log(`🎉 Winner found: ${player.name} in room ${roomCode}`);
        io.to(roomCode).emit('player-won', { winnerName: player.name, winnerId: player.id });
        return;
      }
    }
  }

  game.players.forEach(player => {
    if (player.cards.length >= 2) {
      const bestCard = player.cards.reduce((best, current) => {
        const bestMatches = Object.values(best).flat().filter(num => game.numberCalled.includes(num)).length;
        const currentMatches = Object.values(current).flat().filter(num => game.numberCalled.includes(num)).length;
        return currentMatches >= bestMatches ? current : best;
      });
      const allNumbersOnBestCard = Object.values(bestCard).flat();
      player.result = allNumbersOnBestCard.filter(n => !game.numberCalled.includes(n));
    } else if (player.cards.length === 1) {
      const allNumbersOnCard = Object.values(player.cards[0]).flat();
      player.result = allNumbersOnCard.filter(n => !game.numberCalled.includes(n));
    }
  });

  io.to(roomCode).emit("number-called", game.numberCalled);

  if (game.hostSocketId && game.hostConnected) {
    io.to(game.hostSocketId).emit("players", game.players);
  }
}

module.exports = { createRoom, joinRoom, rollNumber, handleDisconnect, reconnectPlayer, newGame, leaveGame };