import { createContext } from "react";

const value = {
  isOpenModal: false,
  pattern: {},
  inputs: {},
  roomCode: "",
  bingoNumbers: {},
};

const GameContext = createContext(value);
export default GameContext;
