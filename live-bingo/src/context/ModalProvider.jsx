import { useState, useMemo } from "react";
import ModalContext from "./ModalContext";

const ModalProvider = ({ children }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [patternName, setPatternName] = useState("Customize");
  const [patternArray, setPatternArray] = useState([]);
  console.log(patternArray);

  const value = {
    isOpenModal,
    setIsOpenModal,
    patternName,
    setPatternName,
    patternArray,
    setPatternArray,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export default ModalProvider;
