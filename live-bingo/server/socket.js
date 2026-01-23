// server/socket.js
const gameManager = require("./gameManager");

function registerSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log("🔗 New client connected:", socket.id);

    // Room Management
    socket.on("create-room", (hostName, cardNumber, pattern, theme) => {
        gameManager.createRoom(io, socket, hostName, cardNumber, pattern, theme);
    });

    socket.on("join-room", (playerName, roomCode) => {
        gameManager.joinRoom(io, socket, playerName, roomCode);
    });

    socket.on("reconnect-player", (roomCode, persistentId, isHost) => {
        gameManager.reconnectPlayer(io, socket, roomCode, persistentId, isHost);
    });

    // Game Actions
    socket.on("request-new-number", (roomCode) => {
        gameManager.requestNewNumber(io, socket, roomCode);
    });

    socket.on("mark-number", (roomCode, playerId, markedNumbers) => {
        gameManager.markNumber(io, roomCode, playerId, markedNumbers);
    });

    socket.on("request-new-card", (roomCode, playerId, cardIndex) => {
        gameManager.refreshCard(io, socket, roomCode, playerId, cardIndex);
    });

    // Host Actions
    socket.on("new-game", (roomCode) => {
        gameManager.newGame(io, socket, roomCode);
    });

    socket.on("update-theme", (roomCode, newTheme) => {
        gameManager.updateTheme(io, roomCode, newTheme);
    });

    socket.on("update-winning-pattern", (roomCode, newPattern) => {
        gameManager.updateWinningPattern(io, socket, roomCode, newPattern);
    });

    socket.on("host-leave", (roomCode) => {
        gameManager.endGame(io, roomCode);
    });

    socket.on("leave-game", () => {
        gameManager.leaveGame(io, socket);
    });

    socket.on("disconnect", () => {
        gameManager.handleDisconnect(io, socket);
    });
  });
}

module.exports = registerSocketHandlers;