// server/socket.js
const { createRoom, joinRoom, handleDisconnect, reconnectPlayer, newGame, leaveGame, endGame, rollAndShuffleNumber, refreshCard, markNumber, updateTheme, updateWinningPattern } = require("./gameManager");
function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    socket.on("request-new-card", (roomCode, playerId, cardIndex) => {
      refreshCard(io, socket, roomCode, playerId, cardIndex);
    });

    socket.on("mark-number", (roomCode, playerId, markedNumbers) => {
      markNumber(io, roomCode, playerId, markedNumbers);
    });

    socket.on("create-room", (hostName, cardNumber, cardWinningPattern, theme) => {
      createRoom(io, socket, hostName, cardNumber, cardWinningPattern, theme);
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

    socket.on("update-theme", (roomCode, newTheme) => {
      updateTheme(io, roomCode, newTheme);
    });
    socket.on("update-winning-pattern", (roomCode, newPattern) => {
      updateWinningPattern(io, socket, roomCode, newPattern);
    })

    socket.on("disconnect", () => {
      handleDisconnect(io, socket);
    });
  });
}

module.exports = registerSocketHandlers;