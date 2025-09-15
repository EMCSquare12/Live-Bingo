import { io } from "socket.io-client";

// Create one socket instance for the whole app
export const socket = io(import.meta.env.VITE_SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
  reconnectionDelay: 1000,
});