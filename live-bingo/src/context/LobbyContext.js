import { createContext } from "react";

const value = {
  name: "",
  roomCode: "",
};

const LobbyContext = createContext(value);
export default LobbyContext;
