import { useState, useMemo } from "react";
import GameContext from "./GameContext";

const GameProvider = ({ children }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [inputs, setInputs] = useState({
    roomCode: "",
    hostName: "",
    playerName: "",
    number: 1,
  });
  const [pattern, setPattern] = useState({
    name: "Customize",
    array: [],
  });

  console.log(inputs);

  const value = useMemo(
    () => ({
      isOpenModal,
      setIsOpenModal,
      pattern,
      setPattern,
      inputs,
      setInputs,
    }),
    [pattern, isOpenModal, inputs]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
