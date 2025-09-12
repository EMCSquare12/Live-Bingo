import { io } from "socket.io-client";

// Create one socket instance for the whole app
export const socket = io("http://localhost:3001", {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});