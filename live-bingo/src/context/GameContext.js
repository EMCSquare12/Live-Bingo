import { createContext } from "react";

const value = {
  name: "",
  roomCode: "",
};

const GameContext = createContext(value);
export default GameContext;
