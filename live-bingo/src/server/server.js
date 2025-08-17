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
  console.log("Client connected");

  // Create room
  socket.on("create-room", (hostName, cardNumber, cardWinningPattern) => {
    const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
    games[roomCode] = { hostName, cardNumber, cardWinningPattern };
    socket.broadcast.emit("room-created", roomCode, games[roomCode].hostName);

    console.log(`Room created: ${roomCode}`, games);
  });


});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
