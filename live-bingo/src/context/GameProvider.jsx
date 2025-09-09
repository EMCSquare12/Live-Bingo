import { useState, useMemo, useEffect, useCallback } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

const initialState = {
  roomCode: "",
  isOpenModal: false,
  winner: null,
  bingoNumbers: {
    array: [...Array(75)].map((_, i) => i + 1),
    randomNumber: null,
  },
  player: {
    id: "",
    name: "",
    cards: [],
    result: [],
  },
  host: {
    hostName: "",
    cardNumber: 1,
    numberCalled: [],
    cardWinningPattern: {
      name: "",
      index: [],
    },
    players: [],
  },
};

const GameProvider = ({ children }) => {
  const [game, setGame] = useState(initialState);

  // Custom setters for individual state properties, wrapped in useCallback for stability
  const setRoomCode = useCallback((roomCode) => setGame(prev => ({ ...prev, roomCode })), []);
  const setIsOpenModal = useCallback((isOpen) => setGame(prev => ({ ...prev, isOpenModal: isOpen })), []);
  const setWinner = useCallback((winner) => setGame(prev => ({ ...prev, winner })), []);
  const setBingoNumbers = useCallback((updater) => setGame(prev => ({ ...prev, bingoNumbers: typeof updater === 'function' ? updater(prev.bingoNumbers) : updater })), []);
  const setPlayer = useCallback((updater) => setGame(prev => ({ ...prev, player: typeof updater === 'function' ? updater(prev.player) : updater })), []);
  const setHost = useCallback((updater) => setGame(prev => ({ ...prev, host: typeof updater === 'function' ? updater(prev.host) : updater })), []);
  
  const resetGame = useCallback(() => {
    setGame(initialState);
  }, []);

  const handlePlayerWon = useCallback(({ winnerName, winnerId }) => {
    setGame(prev => ({ ...prev, winner: { name: winnerName, id: winnerId } }));
  }, []);

  const handleGameReset = useCallback(() => {
    setGame(prev => ({
      ...prev,
      winner: null,
      bingoNumbers: {
        array: [...Array(75)].map((_, i) => i + 1),
        randomNumber: null,
      },
      host: {
        ...prev.host,
        numberCalled: [],
      }
    }));
  }, []);

  useEffect(() => {
    socket.on("player-won", handlePlayerWon);
    socket.on("game-reset", handleGameReset);

    return () => {
      socket.off("player-won", handlePlayerWon);
      socket.off("game-reset", handleGameReset);
    };
  }, [handlePlayerWon, handleGameReset]); // Dependencies on stable handlers

  const value = useMemo(
    () => ({
      ...game, // Spread all game state properties
      // Provide setters and reset function
      setRoomCode,
      setIsOpenModal,
      setWinner,
      setBingoNumbers,
      setPlayer,
      setHost,
      resetGame,
    }),
    [game, resetGame, setRoomCode, setIsOpenModal, setWinner, setBingoNumbers, setPlayer, setHost]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;

