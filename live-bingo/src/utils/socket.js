import { io } from "socket.io-client";

// Create one socket instance for the whole app
// Fallback for local development if environment variable is missing
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";

export const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});