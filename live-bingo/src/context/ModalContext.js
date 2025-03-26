import { createContext } from "react";

const value = {
  isOpen: false,
};

const ModalContext = createContext(value);
export default ModalContext;
