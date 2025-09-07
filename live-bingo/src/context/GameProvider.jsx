import { useState, useMemo } from "react";
import GameContext from "./GameContext";

const GameProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [bingoNumbers, setBingoNumbers] = useState({
    array: [...Array(75)].map((_, i) => i + 1),
    randomNumber: null,
  });
  const [player, setPlayer] = useState({
    id: "",
    name: "",
    cards: [],
    result: [],
  });
  const [host, setHost] = useState({
    hostName: "",
    cardNumber: 1,
    numberCalled: [],
    cardWinningPattern: {
      name: "",
      index: [],
    },
    players: [],
  });

  const value = useMemo(
    () => ({
      isOpenModal,
      setIsOpenModal,
      host,
      setHost,
      bingoNumbers,
      setBingoNumbers,
      player,
      setPlayer,
      roomCode,
      setRoomCode,
    }),
    [isOpenModal, host, roomCode, player, bingoNumbers]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
