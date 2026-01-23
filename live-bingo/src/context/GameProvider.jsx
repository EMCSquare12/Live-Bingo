// src/context/GameProvider.jsx
import { useState, useMemo, useEffect } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

const GameProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [winMessage, setWinMessage] = useState("");
  const [isNewGameModalVisible, setIsNewGameModalVisible] = useState(false);
  const [isHostLeftModalVisible, setIsHostLeftModalVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confirmation, setConfirmation] = useState({
    isOpen: false,
    message: "",
    onConfirm: () => {},
    onCancel: () => {},
  });
 const [theme, setTheme] = useState({
    name: 'default',
    color: '#374151',
    backgroundColor: '#111827',
    backgroundImage: '',
    cardGridColor: '#4b5563',
    columnColors: {
      B: '#3b82f6',
      I: '#ef4444',
      N: '#9ca3af',
      G: '#22c55e',
      O: '#eab308',
    },
    isTransparent: false,
  });
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(null);

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
    winners: [],
  };

  const [bingoNumbers, setBingoNumbers] = useState(initialBingoNumbers);
  const [player, setPlayer] = useState(initialPlayerState);
  const [host, setHost] = useState(initialHostState);

  useEffect(() => {
    const handleThemeUpdate = (newTheme) => {
      setTheme(newTheme);
    };
    socket.on("theme-updated", handleThemeUpdate);
    return () => {
      socket.off("theme-updated", handleThemeUpdate);
    };
  }, []);

  useEffect(() => {
    if (showConfetti) {
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [showConfetti]);

  const resetGame = () => {
    setHost(initialHostState);
    setPlayer(initialPlayerState);
    setBingoNumbers(initialBingoNumbers);
    setWinMessage("");
    setRoomCode("");
    setIsNewGameModalVisible(false);
    setIsHostLeftModalVisible(false);
    setShowConfetti(false);
    localStorage.removeItem("bingo-session");
    // Force a socket disconnect/reconnect to clear backend state mapping
    socket.disconnect(); 
    socket.connect();
    console.log("Game state has been reset and socket reconnected.");
  };

  useEffect(() => {
    // Defines the logic to restore session
    const restoreSession = () => {
      const session = JSON.parse(localStorage.getItem("bingo-session"));
      if (session && session.roomCode) {
        console.log("🔄 Attempting to restore session...", session);
        setIsReconnecting(true);
        socket.emit(
          "reconnect-player",
          session.roomCode,
          session.id,
          session.isHost
        );
      } else {
        setIsLoading(false);
      }
    };

    // Run immediately on mount
    restoreSession();

    // CRITICAL FIX: Re-run restoration whenever the socket connects/reconnects.
    // This ensures the server always has the correct socket ID for the host/player.
    const handleSocketConnect = () => {
      console.log("✅ Socket connected/reconnected. Verifying session...");
      restoreSession();
    };

    const handleSessionReconnect = (game) => {
      const currentSession = JSON.parse(localStorage.getItem("bingo-session"));
      setRoomCode(game.roomCode);
      setHost({
        id: game.hostId,
        isHost: currentSession?.isHost || false,
        hostName: game.hostName,
        cardNumber: game.cardNumber,
        cardWinningPattern: game.cardWinningPattern,
        numberCalled: game.numberCalled,
        players: game.players,
        winners: game.winners,
      });
      if (game.theme) {
        setTheme(game.theme);
      }
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
      setDisplayNumber(lastCalledNumber);
      if (currentSession && !currentSession.isHost) {
        const currentPlayer = game.players.find(
          (p) => p.id === currentSession.id
        );
        if (currentPlayer) {
          setPlayer(currentPlayer);
        }
      }
      setIsLoading(false);
      setIsReconnecting(false);
    };

    const handleReconnectFailed = (message) => {
      console.error("Reconnect failed:", message);
      // Only stop loading if we aren't in a valid game state
      if (!roomCode) {
        setIsLoading(false);
      }
      setIsReconnecting(false);
    };

    const handleCardRefreshed = (newCards) => {
      setPlayer((prev) => ({
        ...prev,
        cards: newCards,
      }));
    };

    const handlePlayersWon = (winners) => {
      setHost((prev) => ({ ...prev, winners }));
      const amIWinner = winners.some((winner) => winner.id === player.id);

      if (amIWinner) {
        setShowConfetti(true);
        if (winners.length > 1) {
          setWinMessage("BINGO! You and others have won!");
        } else {
          setWinMessage("BINGO! You are the winner!");
        }
      } else {
        const winnerNames = winners.map((w) => w.name).join(", ");
        if (winners.length > 1) {
          setWinMessage(`${winnerNames} are the winners!`);
        } else {
          setWinMessage(`${winnerNames} wins the game!`);
        }
      }
    };

    const handleGameReset = (game) => {
      console.log("Client received game-reset event");
      setShowConfetti(false);
      setDisplayNumber(null); 
      setBingoNumbers({
        array: [...Array(75)].map((_, i) => i + 1),
        randomNumber: null,
      });
      setWinMessage("");
      setHost((prev) => ({
        ...prev,
        numberCalled: game.numberCalled,
        winners: game.winners,
        players: game.players,
      }));
      if (!host.isHost) {
        setIsNewGameModalVisible(true);
      }
    };

    const handleShuffling = (num) => {
      setIsShuffling(true);
      setDisplayNumber(num);
      
      // FAILSAFE: Force stop shuffling after 3 seconds if server response is lost
      setTimeout(() => {
        setIsShuffling((current) => {
            if(current === true) return false;
            return current;
        });
      }, 3000);
    };

    const handleNumberCalled = (numberCalledArray) => {
      setIsShuffling(false);
      const finalNumber = numberCalledArray.at(-1);

      setDisplayNumber(finalNumber);

      setHost((prev) => ({ ...prev, numberCalled: numberCalledArray }));

      const allNumbers = [...Array(75)].map((_, i) => i + 1);
      setBingoNumbers((prev) => ({
        ...prev,
        randomNumber: finalNumber,
        array: allNumbers.filter((num) => !numberCalledArray.includes(num)),
      }));
    };

    const handleWinningPatternUpdated = (newPattern) => {
      console.log("Client received winning-pattern-updated event");
      setHost((prev) => ({
        ...prev,
        cardWinningPattern: newPattern,
      }));
    };

    // Register all listeners
    socket.on("connect", handleSocketConnect); // Listen for connection/reconnection
    socket.on("shuffling", handleShuffling);
    socket.on("number-called", handleNumberCalled);
    socket.on("card-refreshed", handleCardRefreshed);
    socket.on("session-reconnected", handleSessionReconnect);
    socket.on("reconnect-failed", handleReconnectFailed);
    socket.on("players-won", handlePlayersWon);
    socket.on("game-reset", handleGameReset);
    socket.on("winning-pattern-updated", handleWinningPatternUpdated);

    return () => {
      socket.off("connect", handleSocketConnect);
      socket.off("card-refreshed", handleCardRefreshed);
      socket.off("session-reconnected", handleSessionReconnect);
      socket.off("reconnect-failed", handleReconnectFailed);
      socket.off("players-won", handlePlayersWon);
      socket.off("game-reset", handleGameReset);
      socket.off("number-called", handleNumberCalled);
      socket.off("shuffling", handleShuffling);
      socket.off("winning-pattern-updated", handleWinningPatternUpdated);
    };
  }, [player.id, host.isHost]); // Dependencies for useEffect

  useEffect(() => {
    if (roomCode && (host.isHost || player.id)) {
      const session = {
        roomCode,
        id: host.isHost ? host.id : player.id,
        isHost: host.isHost,
      };
      localStorage.setItem("bingo-session", JSON.stringify(session));
    }
  }, [roomCode, player.id, host.isHost, host.id]);
  
  useEffect(() => {
    if (!host.isHost && player.id) {
      const updatedPlayer = host.players.find((p) => p.id === player.id);
      if (updatedPlayer) {
        setPlayer((prevPlayer) => {
          if (JSON.stringify(prevPlayer) !== JSON.stringify(updatedPlayer)) {
            return updatedPlayer;
          }
          return prevPlayer;
        });
      }
    }
  }, [host.players, player.id, host.isHost]);

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
      isReconnecting,
      winMessage,
      setWinMessage,
      isNewGameModalVisible,
      setIsNewGameModalVisible,
      isHostLeftModalVisible,
      setIsHostLeftModalVisible,
      confirmation,
      setConfirmation,
      resetGame,
      showConfetti,
      setShowConfetti,
      isShuffling,
      displayNumber,
      theme,
      setTheme,
    }),
    [
      isOpenModal,
      host,
      roomCode,
      player,
      bingoNumbers,
      isLoading,
      isReconnecting,
      winMessage,
      isNewGameModalVisible,
      isHostLeftModalVisible,
      confirmation,
      showConfetti,
      isShuffling,
      displayNumber,
      theme,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;