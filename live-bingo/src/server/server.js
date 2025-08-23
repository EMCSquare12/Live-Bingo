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
  const newLN = {
    B: generateUniqueNumbers(1, 15, 5), // Unique numbers for 'B'
    I: generateUniqueNumbers(16, 30, 5), // Unique numbers for 'I'
    N: generateUniqueNumbers(31, 45, 5), // Unique numbers for 'N'
    G: generateUniqueNumbers(46, 60, 5), // Unique numbers for 'G'
    O: generateUniqueNumbers(61, 75, 5), // Unique numbers for 'O'
  };

  // Join room
  socket.on("join-room", (playerName, roomCode) => {
    if (!games[roomCode]) {
      socket.emit("error", "Room does not exist");
      return;
    }
    let cards = []
    for (let i = 0; i < games[roomCode].cardNumber; i++) {
      cards.push(newLN)
    }

    const player = { id: socket.id, name: playerName, cards };
    games[roomCode].players.push(player);
    socket.join(roomCode);

    socket.emit("joined-room", roomCode, player);
    console.log(player)

    socket.to(roomCode).emit("player-joined", player);
  });





  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
    // Optional: remove player from games
  });
});


// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
