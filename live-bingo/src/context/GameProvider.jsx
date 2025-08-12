import { useState, useMemo } from "react";
import GameContext from "./GameContext";

const GameProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [bingoNumbers, setBingoNumbers] = useState({
    array: [...Array(75)].map((_, i) => i + 1),
    randomNumber: "X",
  });
  const [player, setPlayer] = useState({
    playerId: "",
    name: "",
  });
  const [host, setHost] = useState({
    hostName: "",
    cardNumber: 1,
    players: [],
  });

  const [pattern, setPattern] = useState({
    name: "Customize",
    array: [],
  });

  const value = useMemo(
    () => ({
      isOpenModal,
      setIsOpenModal,
      pattern,
      setPattern,
      host,
      setHost,
      bingoNumbers,
      setBingoNumbers,
      roomCode,
      setRoomCode,
      player,
      setPlayer,
    }),
    [pattern, isOpenModal, host, roomCode,player, bingoNumbers]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
