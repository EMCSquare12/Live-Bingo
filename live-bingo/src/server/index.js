const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const registerSocketHandlers = require("./socket");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());

// Register all socket events
registerSocketHandlers(io);

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
