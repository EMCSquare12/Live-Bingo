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

io.on("connection", (socket) => {
  const games = {};
  socket.on("create-game", (hostName) => {
    const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();

    games[roomCode] = {
      hostName,
      players: []
    };

    socket.emit("host-game", { roomCode });
    console.log(games)
  });

  socket.on("join-game", ({ roomCode, name }) => {
    const game = games[roomCode];

    if (!game) {
      console.log("Error, game not found");
      socket.emit("error", "Game not found");
      return;
    }

    // const existingPlayer = game.players.find(p => p.playerId === socket.id);
    // if (existingPlayer) {
    //   console.log("Player already joined.");
    //   return;
    // }

    const player = {
      id: socket.id,
      name
    };
    socket.emit("joined-room", player.id);
    game.players.push(player);
    socket.join(roomCode);


    console.log(`Player ${name} joined room ${roomCode}`);
    console.log(games);
  });

});



// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
