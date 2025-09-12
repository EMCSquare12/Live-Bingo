const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

let games = {}; // All active games stored in memory

function createRoom(io, socket, hostName, cardNumber, cardWinningPattern) {
  const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();

  games[roomCode] = {
    hostName,
    cardNumber,
    cardWinningPattern,
    numberCalled: [],
    players: [],
    hostId: socket.id,
    winner: null, // Add winner property to the game state
  };

  socket.join(roomCode);
  socket.emit("room-created", roomCode, socket.id);

  console.log(`🎲 Room created: ${roomCode}`, games[roomCode]);
}

function joinRoom(io, socket, playerName, roomCode) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("error", "Room does not exist");
    return;
  }

  const cards = Array.from({ length: game.cardNumber }, generateCard);
  const calledNumbers = game.numberCalled;

  let result;
  if (cards.length >= 2) {
    const bestCard = cards.reduce((best, current) => {
      const bestMatches = Object.values(best).flat().filter(num => calledNumbers.includes(num)).length;
      const currentMatches = Object.values(current).flat().filter(num => calledNumbers.includes(num)).length;
      return currentMatches >= bestMatches ? current : best;
    });
    const allNumbersOnBestCard = Object.values(bestCard).flat();
    result = allNumbersOnBestCard.filter(n => !calledNumbers.includes(n));
  } else if (cards.length === 1) {
    const allNumbersOnCard = Object.values(cards[0]).flat();
    result = allNumbersOnCard.filter(n => !calledNumbers.includes(n));
  } else {
    result = [];
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
  // Prevent new numbers if a winner has been declared or game doesn't exist
  if (!game || !numberCalled || game.winner) return;

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
        console.log(`🎉 Winner found: ${player.name} in room ${roomCode}`);
        io.to(roomCode).emit('player-won', { winnerName: player.name });
        return; // Exit function once winner is found
      }
    }
  }

  // If no winner, update player results for the host view
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
    } else {
      player.result = [];
    }
  });

  io.to(roomCode).emit("number-called", game.numberCalled);

  if (game.hostId) {
    io.to(game.hostId).emit("players", game.players);
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
      io.to(game.hostId).emit("players", game.players);
    }

    if (game.hostId === socket.id) {
      console.log(`Host of room ${roomCode} disconnected. The room will be removed.`);
      delete games[roomCode];
      io.to(roomCode).emit("error", "Host disconnected. Game over.");
    }
  }
}

module.exports = { createRoom, joinRoom, rollNumber, handleDisconnect };