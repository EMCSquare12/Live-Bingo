import { createContext } from "react";

const value = {
  isOpenModal: false,
  pattern: {},
  host: {},
  bingoNumbers: {},
  roomCode: "",
  player:{}
};

const GameContext = createContext(value);
export default GameContext;
