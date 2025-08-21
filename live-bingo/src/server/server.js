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

  // Join room
  socket.on("join-room", (playerName, roomCode) => {
    if (!games[roomCode]) {
      socket.emit("error", "Room does not exist");
      return;
    }

    const player = { id: socket.id, name: playerName };
    games[roomCode].players.push(player);

    socket.join(roomCode);

    // Tell the joining player
    socket.emit("joined-room", roomCode, player);
    console.log(`Player ${player.name} with id ${player.id}has joined the game`)

    // Tell others in the room
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
