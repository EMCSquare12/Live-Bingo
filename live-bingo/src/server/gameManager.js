const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");

const games = {}; // all active games

function createRoom(io, socket, hostName, cardNumber, cardWinningPattern) {
  const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();

  games[roomCode] = {
    hostName,
    cardNumber,
    cardWinningPattern,
    numberCalled: [],
    players: [],
    hostId: socket.id,
  };

  socket.join(roomCode);
  socket.emit("room-created", roomCode, hostName);

  console.log(`🎲 Room created: ${roomCode}`, games[roomCode]);
}

function joinRoom(io, socket, playerName, roomCode) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("error", "Room does not exist");
    return;
  }

  // Generate multiple cards
  const cards = Array.from({ length: game.cardNumber }, generateCard);

  // Find the best card with most matches
  const calledNumbers = game.numberCalled;
  const cardMatches = cards.map((card) => {
    const allValues = Object.values(card).flat();
    const matched = allValues.filter((n) => calledNumbers.includes(n));
    return { card, matches: matched.length };
  });

  const bestCard = cardMatches.reduce((a, b) => (a.matches >= b.matches ? a : b)).card;

  const result = Object.values(bestCard)
    .flat()
    .filter((n) => !calledNumbers.includes(n));

  const player = { id: socket.id, name: playerName, cards, result };

  if (!game.players.some((p) => p.id === socket.id)) {
    game.players.push(player);
  }

  socket.join(roomCode);
  socket.emit("joined-room", roomCode, player);
  socket.to(roomCode).emit("player-joined", player);

  // Notify host with updated player list
  if (game.hostId) {
    io.to(game.hostId).emit("players", game.players);
  }

  console.log("📌 Updated games:", games);
}

function rollNumber(io, socket, numberCalled, roomCode) {
  const game = games[roomCode];
  if (!game || !numberCalled) return;

  game.numberCalled.push(numberCalled);
  io.to(roomCode).emit("number-called", game.numberCalled);
}

function handleDisconnect(io, socket) {
  console.log("❌ Client disconnected:", socket.id);

  for (const [roomCode, game] of Object.entries(games)) {
    const index = game.players.findIndex((p) => p.id === socket.id);
    if (index !== -1) {
      const [removed] = game.players.splice(index, 1);
      console.log(`🚪 Player ${removed.name} left room ${roomCode}`);

      socket.to(roomCode).emit("player-left", removed);

      // Update host with new player list
      io.to(game.hostId).emit("players", game.players);
    }
  }
}

module.exports = { createRoom, joinRoom, rollNumber, handleDisconnect };
