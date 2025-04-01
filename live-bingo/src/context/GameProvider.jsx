import { useState, useMemo } from "react";
import GameContext from "./GameContext";

const GameProvider = ({ children }) => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [bingoNumbers, setBingoNumbers] = useState({
    array: [...Array(75)].map((_, i) => i + 1),
    randomNumber: "X",
  });
  const [inputs, setInputs] = useState({
    playerName: "",
    hostName: "",
    number: 1,
  });
  const [pattern, setPattern] = useState({
    name: "Customize",
    array: [],
  });

  console.log(inputs);
  console.log(roomCode);

  const value = useMemo(
    () => ({
      isOpenModal,
      setIsOpenModal,
      pattern,
      setPattern,
      inputs,
      setInputs,
      roomCode,
      setRoomCode,
      bingoNumbers,
      setBingoNumbers,
    }),
    [pattern, isOpenModal, inputs, roomCode, bingoNumbers]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
