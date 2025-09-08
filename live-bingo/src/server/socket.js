const { createRoom, joinRoom, rollNumber, handleDisconnect } = require("./gameManager");

function registerSocketHandlers(io) {
    io.on("connection", (socket) => {
        console.log("🔗 New client connected:", socket.id);

        socket.on("create-room", (hostName, cardNumber, cardWinningPattern) => {
            createRoom(io, socket, hostName, cardNumber, cardWinningPattern);
        });

        socket.on("join-room", (playerName, roomCode) => {
            joinRoom(io, socket, playerName, roomCode);
        });

        socket.on("roll-number", (numberCalled, roomCode) => {
            rollNumber(io, socket, numberCalled, roomCode);
        });

        socket.on("disconnect", () => {
            handleDisconnect(io, socket);
        });
    });
}

module.exports = registerSocketHandlers;