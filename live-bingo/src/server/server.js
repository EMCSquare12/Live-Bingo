const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const { hostname } = require("os");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

app.use(cors());

io.on("connection", (socket) => {
  // Host creates a game

  const games = {}; // Store active games
  const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();
  socket.emit("create_game", roomCode);

  socket.on("host_game", (code, hostName) => {
    if (code) {
      games[code] = {
        hostId: socket.id,
        hostName,
      };
    }
    console.log(games);
  });

  // // Player joins a game
  // socket.on("join_game", (gameCode) => {
  //   if (games[gameCode]) {
  //     games[gameCode].players.push(socket.id);
  //     socket.join(gameCode);
  //     io.to(gameCode).emit("player_joined", games[gameCode].players);
  //     console.log(`Player ${socket.id} joined game ${gameCode}`);
  //   } else {
  //     socket.emit("error", "Game not found");
  //   }
  // });

  // // Start game
  // socket.on("start_game", (gameCode) => {
  //   if (games[gameCode]?.host === socket.id) {
  //     io.to(gameCode).emit("game_started");
  //     console.log(`Game ${gameCode} started by host ${socket.id}`);
  //   } else {
  //     socket.emit("error", "Only the host can start the game");
  //   }
  // });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    // Check if the user is a host
    for (const [code, game] of Object.entries(games)) {
      if (game.host === socket.id) {
        console.log(`Host ${socket.id} disconnected, removing game ${code}`);
        delete games[code]; // Remove the game
        io.to(code).emit("game_closed");
      } else {
        // Check if the user is a player
        const playerIndex = game.players.indexOf(socket.id);
        if (playerIndex !== -1) {
          game.players.splice(playerIndex, 1);
          io.to(code).emit("player_left", game.players);
          console.log(`Player ${socket.id} left game ${code}`);
        }
      }
    }
  });
});

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
