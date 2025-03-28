import { createContext } from "react";

const value = {
  isOpenModal: false,
  pattern: {},
  inputs: {},
};

const GameContext = createContext(value);
export default GameContext;
