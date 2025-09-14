import { useState, useMemo, useEffect } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

const GameProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [winMessage, setWinMessage] = useState("");
  const [isNewGameModalVisible, setIsNewGameModalVisible] = useState(false);
  const [isHostLeftModalVisible, setIsHostLeftModalVisible] = useState(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const initialBingoNumbers = {
    array: [...Array(75)].map((_, i) => i + 1),
    randomNumber: null,
  };
  const initialPlayerState = { id: "", name: "", cards: [], result: [] };
  const initialHostState = {
    id: "",
    isHost: false,
    hostName: "",
    cardNumber: 1,
    numberCalled: [],
    cardWinningPattern: { name: "", index: [] },
    players: [],
  };

  const [bingoNumbers, setBingoNumbers] = useState(initialBingoNumbers);
  const [player, setPlayer] = useState(initialPlayerState);
  const [host, setHost] = useState(initialHostState);

  const resetGame = () => {
    setHost(initialHostState);
    setPlayer(initialPlayerState);
    setBingoNumbers(initialBingoNumbers);
    setWinMessage("");
    setRoomCode("");
    setIsNewGameModalVisible(false);
    sessionStorage.removeItem("bingo-session");
    console.log("Game state has been reset.");
  };

  useEffect(() => {
    const session = JSON.parse(sessionStorage.getItem("bingo-session"));
    if (session && session.roomCode) {
      socket.emit(
        "reconnect-player",
        session.roomCode,
        session.id,
        session.isHost
      );
    } else {
      setIsLoading(false);
    }

    const handleSessionReconnect = (game) => {
      const currentSession = JSON.parse(
        sessionStorage.getItem("bingo-session")
      );
      setRoomCode(game.roomCode);
      setHost({
        id: game.hostId,
        isHost: currentSession?.isHost || false,
        hostName: game.hostName,
        cardNumber: game.cardNumber,
        cardWinningPattern: game.cardWinningPattern,
        numberCalled: game.numberCalled,
        players: game.players,
      });
      const allNumbers = [...Array(75)].map((_, i) => i + 1);
      const remainingNumbers = allNumbers.filter(
        (num) => !game.numberCalled.includes(num)
      );
      const lastCalledNumber =
        game.numberCalled.length > 0
          ? game.numberCalled[game.numberCalled.length - 1]
          : null;
      setBingoNumbers({
        array: remainingNumbers,
        randomNumber: lastCalledNumber,
      });
      if (currentSession && !currentSession.isHost) {
        const currentPlayer = game.players.find(
          (p) => p.id === currentSession.id
        );
        if (currentPlayer) {
          setPlayer(currentPlayer);
        }
      }
      setIsLoading(false);
    };

    const handleReconnectFailed = (message) => {
      console.error("Reconnect failed:", message);
      sessionStorage.removeItem("bingo-session");
      setHost((prev) => ({ ...prev, isHost: false, id: "" }));
      setIsLoading(false);
    };

    const handlePlayerWon = ({ winnerName, winnerId }) => {
      if (player.id === winnerId) {
        setWinMessage("BINGO! You are the winner!");
      } else {
        setWinMessage(`${winnerName} wins the game!`);
      }
    };

    const handleGameReset = (game) => {
      console.log("Client received game-reset event");
      setBingoNumbers({
        array: [...Array(75)].map((_, i) => i + 1),
        randomNumber: null,
      });
      setWinMessage("");
      setHost((prev) => ({
        ...prev,
        numberCalled: game.numberCalled,
        winner: game.winner,
        players: game.players,
      }));
      if (!host.isHost) {
        setIsNewGameModalVisible(true);
      }
    };

    const handleNumberCalled = (numberCalled) => {
      setHost((prev) => ({ ...prev, numberCalled }));
    };

    socket.on("session-reconnected", handleSessionReconnect);
    socket.on("reconnect-failed", handleReconnectFailed);
    socket.on("player-won", handlePlayerWon);
    socket.on("game-reset", handleGameReset);
    socket.on("number-called", handleNumberCalled);

    return () => {
      socket.off("session-reconnected", handleSessionReconnect);
      socket.off("reconnect-failed", handleReconnectFailed);
      socket.off("player-won", handlePlayerWon);
      socket.off("game-reset", handleGameReset);
      socket.off("number-called", handleNumberCalled);
    };
  }, [player.id, host.isHost]);

  useEffect(() => {
    if (roomCode && (host.isHost || player.id)) {
      const session = {
        roomCode,
        id: host.isHost ? host.id : player.id,
        isHost: host.isHost,
      };
      sessionStorage.setItem("bingo-session", JSON.stringify(session));
    }
  }, [roomCode, player.id, host.isHost, host.id]);

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
      isLoading,
      winMessage,
      setWinMessage,
      isNewGameModalVisible,
      setIsNewGameModalVisible,
      isHostLeftModalVisible,
      setIsHostLeftModalVisible,
      confirmation,
      setConfirmation,
      resetGame,
    }),
    [
      isOpenModal,
      host,
      roomCode,
      player,
      bingoNumbers,
      isLoading,
      winMessage,
      isNewGameModalVisible,
      isHostLeftModalVisible,
      confirmation,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
