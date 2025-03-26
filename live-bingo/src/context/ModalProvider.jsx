import { useState, useMemo } from "react";
import ModalContext from "./ModalContext";

const ModalProvider = ({ children }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);

  const value = useMemo(() => ({ isOpenModal, setIsOpenModal }), [isOpenModal]);

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
};

export default ModalProvider;
