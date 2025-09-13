const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const registerSocketHandlers = require("./socket");
const { cleanupInactiveRooms } = require("./gameManager"); // Import the cleanup function

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

// Register all socket events
registerSocketHandlers(io);

// Start periodic cleanup of inactive rooms (e.g., every 5 minutes)
// setInterval(() => cleanupInactiveRooms(io), 5 * 60 * 1000);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});