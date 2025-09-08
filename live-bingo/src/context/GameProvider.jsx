import { useState, useMemo, useEffect } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

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

  // Centralized reconnection logic
  useEffect(() => {
    const lastRoomCode = localStorage.getItem("roomCode");
    const lastPlayerId = localStorage.getItem("playerId");
    const lastHostId = localStorage.getItem("hostId");
    const userId = lastPlayerId || lastHostId;

    if (lastRoomCode && userId && socket.id) {
        console.log(`Attempting to reconnect to room ${lastRoomCode} as user ${userId}`);
        socket.emit("request-game-state", { roomCode: lastRoomCode, userId });
    }

    const handleGameStateRetrieved = ({ gameState, yourData }) => {
      console.log("✅ Game state retrieved from server:", gameState);
      
      setRoomCode(gameState.roomCode);
      setBingoNumbers(prev => ({
          ...prev,
          array: [...Array(75)].map((_, i) => i + 1).filter(n => !gameState.numberCalled.includes(n)),
          randomNumber: gameState.numberCalled.slice(-1)[0] || null,
      }));

      setHost({
        hostName: gameState.hostName,
        cardNumber: gameState.cardNumber,
        numberCalled: gameState.numberCalled,
        cardWinningPattern: gameState.cardWinningPattern,
        players: gameState.players,
      });

      if (yourData && yourData.cards) {
         setPlayer(yourData);
      }
    };

    const handleReconnectError = (errorMessage) => {
        console.error("Reconnect failed:", errorMessage);
        // Clear stale data from storage if the game no longer exists
        localStorage.removeItem("roomCode");
        localStorage.removeItem("playerId");
        localStorage.removeItem("hostId");
    };

    socket.on("game-state-retrieved", handleGameStateRetrieved);
    socket.on("error", handleReconnectError);

    return () => {
      socket.off("game-state-retrieved", handleGameStateRetrieved);
      socket.off("error", handleReconnectError);
    };
  }, [socket.id]); // Re-run when socket connects and gets an ID


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