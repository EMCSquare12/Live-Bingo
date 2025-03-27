import { createContext } from "react";

const value = {
  isOpenModal: false,
  patternName: "",
  patternArray: [],
};

const ModalContext = createContext(value);
export default ModalContext;
