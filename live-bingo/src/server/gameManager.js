const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

let games = {}; // All active games stored in memory

function createRoom(io, socket, hostName, cardNumber, cardWinningPattern) {
  let roomCode;
  // Ensure the generated room code is unique
  do {
    roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
  } while (games[roomCode]);

  const hostToken = uuidv4(); // Generate a unique token for the host

  games[roomCode] = {
    hostName,
    cardNumber,
    cardWinningPattern,
    numberCalled: [],
    players: [],
    hostId: socket.id,
    hostToken, // Store the token
    winner: null,
    status: 'waiting', // Initial status
    deletionTimeout: null, // For host reconnection grace period
  };

  socket.join(roomCode);
  // Send back the roomCode and the hostToken
  socket.emit("room-created", roomCode, hostToken);

  console.log(`🎲 Room created: ${roomCode}`);
}

function joinRoom(io, socket, playerName, roomCode) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("error", "Room not found. Please check the code and try again.");
    return;
  }
  
  if (game.status !== 'waiting') {
    socket.emit("error", "This game is already in progress or has finished.");
    return;
  }

  const cards = Array.from({ length: game.cardNumber }, generateCard);
  const winningPatternIndices = game.cardWinningPattern.index;
  
  let result = [];
  if (cards.length > 0) {
      const firstCardNumbers = [...cards[0].B, ...cards[0].I, ...cards[0].N, ...cards[0].G, ...cards[0].O];
      // Initially, the result is all numbers needed for the pattern on the first card
      result = winningPatternIndices.map(index => firstCardNumbers[index]);
  }

  const player = { id: socket.id, name: playerName, cards, result };

  game.players.push(player);

  socket.join(roomCode);
  socket.emit("joined-room", roomCode, player);
  io.to(roomCode).emit("player-joined", player);
  if (game.hostId) {
    io.to(game.hostId).emit("players", game.players);
  }
}

function rollNumber(io, socket, numberCalled, roomCode) {
  const game = games[roomCode];
  if (!game || !numberCalled || game.winner) return;

  // Set game status to inprogress on the first roll
  if (game.numberCalled.length === 0) {
    game.status = 'inprogress';
  }

  if (!game.numberCalled.includes(numberCalled)) {
    game.numberCalled.push(numberCalled);
  }

  const winningPatternIndices = game.cardWinningPattern.index;

  // Check for a winner
  for (const player of game.players) {
    for (const card of player.cards) {
      const cardNumbers = [...card.B, ...card.I, ...card.N, ...card.G, ...card.O];

      const requiredNumbers = winningPatternIndices.map(index => cardNumbers[index]);
      const isWinner = requiredNumbers.every(num => game.numberCalled.includes(num));

      if (isWinner) {
        game.winner = player.name; // Set winner to stop the game
        game.status = 'finished'; // Update status
        console.log(`🎉 Winner found: ${player.name} in room ${roomCode}`);
        io.to(roomCode).emit('player-won', { winnerName: player.name, winnerId: player.id });
        return; // Exit function once winner is found
      }
    }
  }

  // If no winner, update player results for the host view based on the winning pattern
  game.players.forEach(player => {
    let bestCardInfo = {
        card: null,
        neededNumbers: [],
        matches: -1
    };

    if (player.cards.length > 0) {
        player.cards.forEach(card => {
            const cardNumbers = [...card.B, ...card.I, ...card.N, ...card.G, ...card.O];
            const patternNumbers = winningPatternIndices.map(index => cardNumbers[index]);
            
            const calledPatternNumbers = patternNumbers.filter(num => game.numberCalled.includes(num));
            const neededPatternNumbers = patternNumbers.filter(num => !game.numberCalled.includes(num));

            // The best card is the one with the most matches for the pattern
            if (calledPatternNumbers.length > bestCardInfo.matches) {
                bestCardInfo = {
                    card: card,
                    neededNumbers: neededPatternNumbers,
                    matches: calledPatternNumbers.length
                };
            }
        });
        player.result = bestCardInfo.neededNumbers;
    } else {
        player.result = [];
    }
  });

  io.to(roomCode).emit("number-called", game.numberCalled);

  if (game.hostId) {
    io.to(game.hostId).emit("players", game.players);
  }
}

function newGame(io, roomCode) {
  const game = games[roomCode];
  if (!game) {
    console.log(`Attempted to reset non-existent room: ${roomCode}`);
    return;
  }
  
  const winningPatternIndices = game.cardWinningPattern.index;

  game.numberCalled = [];
  game.winner = null;
  game.status = 'waiting'; // Reset status for new game

  game.players.forEach(player => {
    // Reset the result to be the numbers needed for the pattern on their first card
    if (player.cards.length > 0) {
        const firstCardNumbers = [...player.cards[0].B, ...player.cards[0].I, ...player.cards[0].N, ...player.cards[0].G, ...player.cards[0].O];
        player.result = winningPatternIndices.map(index => firstCardNumbers[index]);
    } else {
        player.result = [];
    }
  });
  
  io.to(roomCode).emit("game-reset");

  if (game.hostId) {
    io.to(game.hostId).emit("players", game.players);
  }

  console.log(`🔄 Game reset for room: ${roomCode}`);
}

function verifyHost(socket, { roomCode, hostToken }) {
    const game = games[roomCode];
    if (!game) {
        socket.emit("host-verified", { isHost: false, error: "Room not found." });
        return;
    }

    // Verify using the token instead of socket.id
    if (game.hostToken === hostToken) {
        // If there's a pending deletion from a previous disconnection, cancel it.
        if (game.deletionTimeout) {
            clearTimeout(game.deletionTimeout);
            game.deletionTimeout = null;
            console.log(`↩️ Host for room ${roomCode} reconnected. Deletion cancelled.`);
        }
        
        // Update the hostId to the new socket id, reclaiming the room
        game.hostId = socket.id;
        socket.emit("host-verified", { isHost: true });
    } else {
        socket.emit("host-verified", { isHost: false });
    }
}

function handleDisconnect(io, socket) {
  console.log("❌ Client disconnected:", socket.id);
  for (const [roomCode, game] of Object.entries(games)) {
    const playerIndex = game.players.findIndex((p) => p.id === socket.id);
    if (playerIndex !== -1) {
      const removedPlayer = game.players.splice(playerIndex, 1);
      console.log(`🚪 Player ${removedPlayer[0].name} removed from room ${roomCode}.`);
      io.to(roomCode).emit("player-disconnected", socket.id);
      if (game.hostId) {
          io.to(game.hostId).emit("players", game.players);
      }
    }

    if (game.hostId === socket.id) {
       console.log(`Host of room ${roomCode} disconnected. Starting 10-second deletion timer.`);
       // Mark host as disconnected temporarily
       game.hostId = null;

       game.deletionTimeout = setTimeout(() => {
            // Check if the game still exists and if the host hasn't reconnected
            if (games[roomCode] && !games[roomCode].hostId) {
                console.log(`Timer expired for room ${roomCode}. Deleting room.`);
                delete games[roomCode];
                io.to(roomCode).emit("error", "Host disconnected. Game over.");
            }
       }, 10000); // 10-second grace period
    }
  }
}

module.exports = { createRoom, joinRoom, rollNumber, handleDisconnect, newGame, verifyHost };

