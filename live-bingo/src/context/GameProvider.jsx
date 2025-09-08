import { useState, useMemo, useEffect } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

const GameProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [winner, setWinner] = useState(null);
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

  useEffect(() => {
    const handlePlayerWon = ({ winnerName }) => {
      setWinner(winnerName);
    };

    socket.on("player-won", handlePlayerWon);

    return () => {
      socket.off("player-won", handlePlayerWon);
    };
  }, []);

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
      winner,
      setWinner,
    }),
    [isOpenModal, host, roomCode, player, bingoNumbers, winner]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
