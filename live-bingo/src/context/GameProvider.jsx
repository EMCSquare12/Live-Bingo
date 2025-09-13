import { useState, useMemo, useEffect } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

const GameProvider = ({ children }) => {
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [winner, setWinner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
    id: "",
    isHost: false,
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

      // *** THIS IS THE FIX ***
      // Reconstruct the bingo board's visual state from the server's data.
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
      // *** END OF FIX ***

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

    socket.on("session-reconnected", handleSessionReconnect);
    socket.on("reconnect-failed", handleReconnectFailed);
    socket.on("player-won", ({ winnerName }) => setWinner(winnerName));

    return () => {
      socket.off("session-reconnected", handleSessionReconnect);
      socket.off("reconnect-failed", handleReconnectFailed);
      socket.off("player-won");
    };
  }, []);

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
      winner,
      setWinner,
      isLoading,
    }),
    [isOpenModal, host, roomCode, player, bingoNumbers, winner, isLoading]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;
