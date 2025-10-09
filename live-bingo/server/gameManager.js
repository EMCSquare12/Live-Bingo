const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

let games = {}; // All active games stored in memory

function calculateBestCardResult(cards, winningPattern, markedNumbers = []) {
  if (!cards || cards.length === 0) {
    return [];
  }

  const winningIndices = winningPattern.index;
  const markedNumbersSet = new Set(markedNumbers);

  let bestCardResult = null;
  let minRemaining = Infinity;

  for (const card of cards) {
    const cardNumbers = [
      ...card.B,
      ...card.I,
      ...card.N,
      ...card.G,
      ...card.O,
    ];

    const requiredNumbersOnCard = winningIndices
      .map((index) => cardNumbers[index])
      .filter((num) => num !== null);

    const remainingOnCard = requiredNumbersOnCard.filter(
      (num) => !markedNumbersSet.has(num)
    );

    if (remainingOnCard.length < minRemaining) {
      minRemaining = remainingOnCard.length;
      bestCardResult = remainingOnCard;
    }
  }
  return bestCardResult || [];
}

function rollAndShuffleNumber(io, socket, roomCode) {
  const game = games[roomCode];
  if (
    !game ||
    game.hostSocketId !== socket.id ||
    (game.winners && game.winners.length > 0) ||
    game.isShuffling
  ) {
    return;
  }

  game.isShuffling = true;

  const shuffleInterval = setInterval(() => {
    const randomShuffleNumber = Math.floor(Math.random() * 75) + 1;
    io.to(roomCode).emit("shuffling", randomShuffleNumber);
  }, 60);

  setTimeout(() => {
    clearInterval(shuffleInterval);
    game.isShuffling = false;

    const availableNumbers = [...Array(75)]
      .map((_, i) => i + 1)
      .filter((n) => !game.numberCalled.includes(n));

    if (availableNumbers.length > 0) {
      const randomNumber =
        availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
      rollNumber(io, socket, randomNumber, roomCode);
    }
  }, 1500);
}


function endGame(io, roomCode) {
  const game = games[roomCode];
  if (game) {
    console.log(`Ending game in room ${roomCode}.`);

    // Notify all clients in the room that the host has left
    io.to(roomCode).emit("host-left");

    // Disconnect all player sockets
    const playerSockets = game.players.map(p => io.sockets.sockets.get(p.socketId)).filter(s => s);
    playerSockets.forEach(socket => socket.disconnect(true));

    // Disconnect the host socket if it still exists
    const hostSocket = io.sockets.sockets.get(game.hostSocketId);
    if (hostSocket) {
      hostSocket.disconnect(true);
    }

    delete games[roomCode];
    console.log(`🧹 Room ${roomCode} has been closed and removed.`);
  }
}

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
    numberCalled: [null], // Initialize with null for the "FREE" space
    players: [],
    winners: [],
    isNewRoundStarting: false,
    disconnectTimeout: null, // To manage host disconnects
    isShuffling: false, // Add this to prevent multiple rolls
  };

  socket.join(roomCode);
  socket.emit("room-created", roomCode, hostId);
  console.log(`🎲 Room created: ${roomCode}`);
}

function joinRoom(io, socket, playerName, roomCode) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("room-not-found", "Room code doesn't exist.");
    return;
  }

  if (game.numberCalled.length > 1) {
    // Changed to > 1 to allow joining before first roll
    socket.emit("game-started", "The game has already started in this room.");
    return;
  }

  const cards = Array.from({ length: game.cardNumber }, generateCard);
  const playerId = uuidv4();
  const player = {
    id: playerId,
    socketId: socket.id,
    name: playerName,
    cards,
    result: calculateBestCardResult(cards, game.cardWinningPattern, []),
    markedNumbers: [],
    connected: true,
  };

  game.players.push(player);

  socket.join(roomCode);
  socket.emit("joined-room", roomCode, { ...game, newPlayer: player });

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
    console.log(
      `Host ${game.hostName} reconnected. New socket ID: ${socket.id}`
    );
    game.hostSocketId = socket.id;
    game.hostConnected = true;

    // Clear the disconnect timeout if the host reconnects in time
    if (game.disconnectTimeout) {
      clearTimeout(game.disconnectTimeout);
      game.disconnectTimeout = null;
      console.log(`Disconnect timer for room ${roomCode} cleared.`);
    }
  } else if (!isHost) {
    const player = game.players.find((p) => p.id === persistentId);
    if (player) {
      console.log(
        `Player ${player.name} reconnected. New socket ID: ${socket.id}`
      );
      player.socketId = socket.id;
      player.connected = true;

      // Clear the disconnect timeout if the player reconnects in time
      if (player.disconnectTimeout) {
        clearTimeout(player.disconnectTimeout);
        player.disconnectTimeout = null;
        console.log(`Disconnect timer for player ${player.name} in room ${roomCode} cleared.`);
      }

    }  else {
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
    const playerIndex = game.players.findIndex((p) => p.socketId === socket.id);
    if (playerIndex !== -1) {
      const removedPlayer = game.players.splice(playerIndex, 1)[0];
      console.log(
        `Player ${removedPlayer.name} intentionally left room ${roomCode}.`
      );

      if (game.hostSocketId && game.hostConnected) {
        io.to(game.hostSocketId).emit("player-left", removedPlayer.name);
        io.to(game.hostSocketId).emit("players", game.players);
      }

      // Acknowledge the leave to the client so it can safely navigate
      socket.emit("leave-acknowledged");

      break;
    }
  }
}

function handleDisconnect(io, socket) {
  console.log(`❌ Client disconnected: ${socket.id}`);

  for (const [roomCode, game] of Object.entries(games)) {
    if (game.hostSocketId === socket.id) {
      console.log(`Host ${game.hostName} temporarily disconnected.`);
      game.hostConnected = false;

      // Set a timer to end the game if the host doesn't reconnect
      game.disconnectTimeout = setTimeout(() => {
        if (games[roomCode] && !games[roomCode].hostConnected) {
          console.log(`Host did not reconnect for room ${roomCode}. Ending game.`);
          endGame(io, roomCode);
        }
      }, 30000); // 30-second grace period

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

      // Set a timer to remove the player if they don't reconnect
      player.disconnectTimeout = setTimeout(() => {
        if (games[roomCode] && !player.connected) {
          console.log(`Player ${player.name} did not reconnect for room ${roomCode}. Removing from game.`);
          game.players.splice(playerIndex, 1);
          if (game.hostSocketId && game.hostConnected) {
            io.to(game.hostSocketId).emit("players", game.players);
          }
        }
      }, 30000); // 30-second grace period

      break;
    }
  }
}

function updateWinningPattern(io, socket, roomCode, newPattern) {
  const game = games[roomCode];
  if (game && game.hostSocketId === socket.id) {
    game.cardWinningPattern = newPattern;
    game.players.forEach((player) => {
      player.result = calculateBestCardResult(
        player.cards,
        newPattern,
        player.markedNumbers
      );
    });
    io.to(roomCode).emit("winning-pattern-updated", newPattern);
    io.to(game.hostSocketId).emit("players", game.players);
  }
}

function newGame(io, socket, roomCode) {
  const game = games[roomCode];
  if (!game || game.hostSocketId !== socket.id) {
    return;
  }

  console.log(`✨ Starting a new game in room ${roomCode}`);

  game.isNewRoundStarting = true;
  game.numberCalled = [null]; // Reset with null for the "FREE" space
  game.winners = [];

  game.players.forEach((player) => {
    player.result = calculateBestCardResult(
      player.cards,
      game.cardWinningPattern,
      []
    );
    player.markedNumbers = [];
  });

  io.to(roomCode).emit("game-reset", game);

  setTimeout(() => {
    if (games[roomCode]) {
      games[roomCode].isNewRoundStarting = false;
    }
  }, 5000);
}

function refreshCard(io, socket, roomCode, playerId, cardIndex) {
  const game = games[roomCode];
  if (!game) return;

  const player = game.players.find((p) => p.id === playerId);
  if (!player) return;

  if (game.numberCalled.length > 1) {
    // Game has started, do not allow card refresh.
    return;
  }

  const newCard = generateCard();
  player.cards[cardIndex] = newCard;

  player.result = calculateBestCardResult(
    player.cards,
    game.cardWinningPattern,
    []
  );
  player.markedNumbers = [];

  socket.emit("card-refreshed", player.cards);
  if (game.hostSocketId) {
    io.to(game.hostSocketId).emit("players", game.players);
  }
}

function markNumber(io, roomCode, playerId, markedNumbers) {
  const game = games[roomCode];
  if (!game) return;

  const player = game.players.find((p) => p.id === playerId);
  if (!player) return;

  player.markedNumbers = markedNumbers;

  player.result = calculateBestCardResult(
    player.cards,
    game.cardWinningPattern,
    player.markedNumbers
  );

  if (game.hostSocketId && game.hostConnected) {
    io.to(game.hostSocketId).emit("players", game.players);
  }

  const winningPatternIndices = game.cardWinningPattern.index;
  let hasWinner = false;

  for (const card of player.cards) {
    const cardNumbers = [
      ...card.B,
      ...card.I,
      ...card.N,
      ...card.G,
      ...card.O,
    ];
    const requiredNumbers = winningPatternIndices
      .map((index) => cardNumbers[index])
      .filter((num) => num !== null); // Filter out null values

    const isWinner = requiredNumbers.every((num) =>
      player.markedNumbers.includes(num)
    );

    if (isWinner) {
      if (!game.winners.some((w) => w.id === player.id)) {
        game.winners.push({ id: player.id, name: player.name });
        hasWinner = true;
      }
    }
  }

  if (hasWinner) {
    setTimeout(() => {
      console.log(
        `🎉 Winner(s) found: ${game.winners
          .map((w) => w.name)
          .join(", ")} in room ${roomCode}`
      );
      io.to(roomCode).emit("players-won", game.winners);
    }, 100);
  }
}


function rollNumber(io, socket, numberCalled, roomCode) {
  const game = games[roomCode];
  if (
    !game ||
    !numberCalled ||
    (game.winners && game.winners.length > 0) ||
    game.isNewRoundStarting ||
    game.players.length < 2
  ) {
    console.log("Roll blocked. Conditions not met.");
    return;
  }

  if (!game.numberCalled.includes(numberCalled)) {
    game.numberCalled.push(numberCalled);
  }

  io.to(roomCode).emit("number-called", game.numberCalled);
}

module.exports = {
  createRoom,
  joinRoom,
  rollNumber,
  handleDisconnect,
  reconnectPlayer,
  newGame,
  leaveGame,
  endGame,
  rollAndShuffleNumber,
  refreshCard,
  updateWinningPattern,
  markNumber,
};