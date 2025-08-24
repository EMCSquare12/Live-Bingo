const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());
const games = {};

io.on("connection", (socket) => {
  // Create room
  socket.on("create-room", (hostName, cardNumber, cardWinningPattern) => {
    const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
    games[roomCode] = {
      hostName,
      cardNumber,
      cardWinningPattern,
      players: []
    };
    socket.join(roomCode);

    // Only tell the creator their room was created
    socket.emit("room-created", roomCode, hostName);
    console.log(`Room created: ${roomCode}`, games[roomCode]);
  });

  const generateUniqueNumbers = (min, max, count) => {
    const uniqueNumbers = new Set();

    while (uniqueNumbers.size < count) {
      uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    return Array.from(uniqueNumbers);
  };
  const generateCard = () => ({
    B: generateUniqueNumbers(1, 15, 5),
    I: generateUniqueNumbers(16, 30, 5),
    N: generateUniqueNumbers(31, 45, 5),
    G: generateUniqueNumbers(46, 60, 5),
    O: generateUniqueNumbers(61, 75, 5),
  });


  // Join room
  socket.on("join-room", (playerName, roomCode) => {
    if (!games[roomCode]) {
      socket.emit("error", "Room does not exist");
      return;
    }
    let cards = []
    for (let i = 0; i < games[roomCode].cardNumber; i++) {
      cards.push(generateCard())
    }
    const player = { id: socket.id, name: playerName, cards };
    const exists = games[roomCode].players.find(p => p.id === socket.id);
    if (!exists) {
      games[roomCode].players.push(player);
    }
    socket.join(roomCode);
    socket.emit("joined-room", roomCode, player);
    console.log(games[roomCode])
    socket.to(roomCode).emit("player-joined", player);
  });





  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);

    for (const [roomCode, game] of Object.entries(games)) {
      const index = game.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        const [removed] = game.players.splice(index, 1);
        console.log(`Player ${removed.name} removed from room ${roomCode}`);
        socket.to(roomCode).emit("player-left", removed);
      }
    }
  });

});


// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
