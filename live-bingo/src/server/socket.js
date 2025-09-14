const { createRoom, joinRoom, handleDisconnect, reconnectPlayer, newGame, leaveGame, endGame, rollAndShuffleNumber } = require("./gameManager");

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    socket.on("create-room", (hostName, cardNumber, cardWinningPattern) => {
      createRoom(io, socket, hostName, cardNumber, cardWinningPattern);
    });

    socket.on("join-room", (playerName, roomCode, callback) => {
      joinRoom(io, socket, playerName, roomCode, callback);
    });

    socket.on("reconnect-player", (roomCode, playerId, isHost) => {
      reconnectPlayer(io, socket, roomCode, playerId, isHost);
    });

    socket.on("leave-game", () => {
      leaveGame(io, socket);
    });

    socket.on("host-leave", (roomCode) => {
      endGame(io, roomCode);
    });

    socket.on("new-game", (roomCode) => {
      newGame(io, socket, roomCode);
    });

    // Replace "roll-number" with this new event
    socket.on("request-new-number", (roomCode) => {
      rollAndShuffleNumber(io, socket, roomCode);
    });

    socket.on("disconnect", () => {
      handleDisconnect(io, socket);
    });
  });
}

module.exports = registerSocketHandlers;