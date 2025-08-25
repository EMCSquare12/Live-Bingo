// src/socket.js
import { io } from "socket.io-client";

// create one socket instance for the whole app
export const socket = io("http://localhost:3001", {
    autoConnect: true,
    reconnection: true,
});
