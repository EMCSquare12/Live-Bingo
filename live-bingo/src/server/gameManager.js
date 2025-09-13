const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

let games = {}; // All active games stored in memory

// This function will run periodically to clean up old, abandoned games.
setInterval(() => {
  const now = Date.now();
  const TEN_MINUTES = 10 * 60 * 1000;

  for (const roomCode in games) {
    const game = games[roomCode];

    // If the host has been marked as disconnected for a long time, remove the room.
    if (!game.hostConnected && (now - game.lastActivity > TEN_MINUTES)) {
      console.log(`[Cleanup] Deleting abandoned room ${roomCode} due to host inactivity.`);
      // Notify players in the room before deleting
      io.to(roomCode).emit("error", "Room closed due to host inactivity.");
      delete games[roomCode];
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes


function createRoom(io, socket, hostName, cardNumber, cardWinningPattern) {
  const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
  const hostId = uuidv4();

  games[roomCode] = {
    hostName,
    hostId,
    hostSocketId: socket.id,
    hostConnected: true, // Start as connected
    cardNumber,
    cardWinningPattern,
    numberCalled: [],
    players: [],
    winners: [],
    lastActivity: Date.now(),
  };

  socket.join(roomCode);
  socket.emit("room-created", roomCode, hostId);
  console.log(`🎲 Room created: ${roomCode} by host ${hostId}`);
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
  game.lastActivity = Date.now();

  socket.join(roomCode);
  socket.emit("joined-room", roomCode, player);

  if (game.hostSocketId && game.hostConnected) {
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
    game.hostConnected = true; // Mark as connected
  } else if (!isHost) {
    const player = game.players.find((p) => p.id === persistentId);
    if (player) {
      console.log(`Player ${player.name} reconnected. New socket ID: ${socket.id}`);
      player.socketId = socket.id;
      player.connected = true; // Mark as connected
    } else {
      socket.emit("reconnect-failed", "Player not found");
      return;
    }
  } else {
    socket.emit("reconnect-failed", "Authorization error");
    return;
  }

  game.lastActivity = Date.now();
  socket.emit("session-reconnected", { ...game, roomCode });

  if (game.hostSocketId && game.hostConnected) {
    io.to(game.hostSocketId).emit("players", game.players);
  }
}

function handleDisconnect(io, socket) {
  console.log(`❌ Client disconnected: ${socket.id}`);

  for (const game of Object.values(games)) {
    if (game.hostSocketId === socket.id) {
      console.log(`Host of room ${game.hostId} disconnected.`);
      game.hostConnected = false; // Simply mark as disconnected
      game.lastActivity = Date.now();
      break;
    }

    const player = game.players.find((p) => p.socketId === socket.id);
    if (player) {
      console.log(`Player ${player.name} disconnected.`);
      player.connected = false; // Simply mark as disconnected
      game.lastActivity = Date.now();

      if (game.hostSocketId && game.hostConnected) {
        io.to(game.hostSocketId).emit("players", game.players);
      }
      break;
    }
  }
}


// --- rollNumber function remains unchanged ---
function rollNumber(io, socket, numberCalled, roomCode) {
  const game = games[roomCode];
  if (!game || !numberCalled || game.winner) return;
  game.lastActivity = Date.now();
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
        game.winner = player.name;
        io.to(roomCode).emit('player-won', { winnerName: player.name });
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
  if (game.hostSocketId) {
    io.to(game.hostSocketId).emit("players", game.players);
  }
}


module.exports = { createRoom, joinRoom, rollNumber, handleDisconnect, reconnectPlayer };