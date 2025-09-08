const { v4: uuidv4 } = require("uuid");
const { generateCard } = require("./utils");
const fs = require('fs');
const path = require('path');

const gamesFilePath = path.join(__dirname, 'games.json');
let games = {}; // All active games will be loaded into here

// --- Persistence Logic ---
function loadGames() {
    try {
        if (fs.existsSync(gamesFilePath)) {
            const data = fs.readFileSync(gamesFilePath, 'utf8');
            games = JSON.parse(data);
            console.log('✅ Previous game states loaded from games.json.');
            
            // On a server restart, all old connections are gone.
            // Mark all players as disconnected until they reconnect.
            Object.values(games).forEach(game => {
                if (game.players) {
                    game.players.forEach(p => p.disconnected = true);
                }
            });

        }
    } catch (error) {
        console.error('Could not load game states:', error);
        games = {};
    }
}

function saveGames() {
    try {
        fs.writeFileSync(gamesFilePath, JSON.stringify(games, null, 2));
    } catch (error) {
        console.error('Could not save game states:', error);
    }
}

// Load any existing games when the server first starts
loadGames();
// --- End Persistence Logic ---


function createRoom(io, socket, hostName, cardNumber, cardWinningPattern) {
  const roomCode = uuidv4().replace(/-/g, "").substring(0, 6).toUpperCase();

  games[roomCode] = {
    hostName,
    cardNumber,
    cardWinningPattern,
    numberCalled: [],
    players: [],
    hostId: socket.id,
  };

  socket.join(roomCode);
  socket.emit("room-created", roomCode, socket.id);
  saveGames(); // Save state

  console.log(`🎲 Room created: ${roomCode}`, games[roomCode]);
}

function joinRoom(io, socket, playerName, roomCode) {
  const game = games[roomCode];
  if (!game) {
    socket.emit("error", "Room does not exist");
    return;
  }

  const cards = Array.from({ length: game.cardNumber }, generateCard);
  const calledNumbers = game.numberCalled;
  const cardMatches = cards.map((card) => {
    const allValues = Object.values(card).flat();
    const matched = allValues.filter((n) => calledNumbers.includes(n));
    return { card, matches: matched.length };
  });
  const bestCard = cardMatches.reduce((a, b) => (a.matches >= b.matches ? a : b)).card;
  const result = Object.values(bestCard)
    .flat()
    .filter((n) => !calledNumbers.includes(n));
  
  const player = { id: socket.id, name: playerName, cards, result, disconnected: false };

  game.players.push(player);
  saveGames(); // Save state

  socket.join(roomCode);
  socket.emit("joined-room", roomCode, player);
  io.to(roomCode).emit("player-joined", player);
  if (game.hostId) {
    io.to(game.hostId).emit("players", game.players.filter(p => !p.disconnected));
  }
  console.log("📌 Updated games:", games);
}

function retrieveGameState(io, socket, { roomCode, userId }) {
    const game = games[roomCode];
    if (!game) {
        socket.emit("error", "Game not found. Starting fresh.");
        return;
    }
    
    let userRole = null;
    let userData = null;
    let stateChanged = false;

    if (game.hostId === userId) {
        game.hostId = socket.id;
        userRole = "host";
        userData = { hostName: game.hostName };
        stateChanged = true;
        console.log(`Host ${game.hostName} reconnected to room ${roomCode} with new socket ID ${socket.id}`);
    } else {
        const player = game.players.find(p => p.id === userId);
        if (player) {
            player.id = socket.id;
            player.disconnected = false;
            userRole = "player";
            userData = player;
            stateChanged = true;
            console.log(`Player ${player.name} reconnected to room ${roomCode} with new socket ID ${socket.id}`);
        }
    }
    
    if (userRole) {
        if (stateChanged) saveGames(); // Save updated socket ID

        socket.join(roomCode);
        const activePlayers = game.players.filter(p => !p.disconnected);
        const gameState = { ...game, players: activePlayers };
        
        socket.emit("game-state-retrieved", { gameState, yourData: userData });
        socket.to(roomCode).emit("player-reconnected", userData);
        io.to(game.hostId).emit("players", activePlayers);
    } else {
        socket.emit("error", "User not found in game. Starting fresh.");
    }
}

function rollNumber(io, socket, numberCalled, roomCode) {
  const game = games[roomCode];
  if (!game || !numberCalled) return;

  game.numberCalled.push(numberCalled);
  saveGames(); // Save state
  io.to(roomCode).emit("number-called", game.numberCalled);
}

function handleDisconnect(io, socket) {
  console.log("❌ Client disconnected:", socket.id);
  let stateChanged = false;
  for (const [roomCode, game] of Object.entries(games)) {
    const player = game.players.find((p) => p.id === socket.id && !p.disconnected);
    if (player) {
      player.disconnected = true;
      stateChanged = true;
      console.log(`🚪 Player ${player.name} disconnected from room ${roomCode}. Data preserved.`);
      
      const activePlayers = game.players.filter(p => !p.disconnected);
      io.to(game.hostId).emit("players", activePlayers);
      io.to(roomCode).emit("player-disconnected", player.id);
    }
    
    if (game.hostId === socket.id) {
        console.log(`Host of room ${roomCode} disconnected. Host ID is now stale.`);
    }
  }
  if (stateChanged) saveGames(); // Save state
}

module.exports = { createRoom, joinRoom, rollNumber, handleDisconnect, retrieveGameState };