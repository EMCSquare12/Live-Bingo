// src/context/GameProvider.jsx
import { useState, useMemo, useEffect, useCallback } from "react";
import GameContext from "./GameContext";
import { socket } from "../utils/socket";

const GameProvider = ({ children }) => {
  // --- UI State ---
  const [roomCode, setRoomCode] = useState("");
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [winMessage, setWinMessage] = useState("");
  const [isNewGameModalVisible, setIsNewGameModalVisible] = useState(false);
  const [isHostLeftModalVisible, setIsHostLeftModalVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [displayNumber, setDisplayNumber] = useState(null);
  
  const [confirmation, setConfirmation] = useState({
    isOpen: false, message: "", onConfirm: () => {}, onCancel: () => {},
  });

  const [theme, setTheme] = useState({
    name: 'default',
    color: '#374151',
    backgroundColor: '#111827',
    backgroundImage: '',
    cardGridColor: '#4b5563',
    columnColors: { B: '#3b82f6', I: '#ef4444', N: '#9ca3af', G: '#22c55e', O: '#eab308' },
    isTransparent: false,
  });

  // --- Game State ---
  const initialBingoNumbers = {
    array: Array.from({ length: 75 }, (_, i) => i + 1),
    randomNumber: null,
  };
  
  const [bingoNumbers, setBingoNumbers] = useState(initialBingoNumbers);
  const [player, setPlayer] = useState({ id: "", name: "", cards: [], result: [] });
  const [host, setHost] = useState({
    id: "", isHost: false, hostName: "", cardNumber: 1, 
    numberCalled: [null], cardWinningPattern: { name: "", index: [] }, 
    players: [], winners: []
  });

  // --- Actions ---

  const resetGame = useCallback(() => {
    console.log("Resetting Game State locally.");
    setHost({ id: "", isHost: false, hostName: "", cardNumber: 1, numberCalled: [null], cardWinningPattern: { name: "", index: [] }, players: [], winners: [] });
    setPlayer({ id: "", name: "", cards: [], result: [] });
    setBingoNumbers(initialBingoNumbers);
    setWinMessage("");
    setRoomCode("");
    setIsNewGameModalVisible(false);
    setIsHostLeftModalVisible(false);
    setShowConfetti(false);
    localStorage.removeItem("bingo-session");
    // Ensure socket clears subscriptions but stays open
    socket.off(); 
  }, []);

  // --- Socket Event Handlers ---

  useEffect(() => {
    // 1. Session Restoration Logic
    const attemptReconnect = () => {
      const session = JSON.parse(localStorage.getItem("bingo-session"));
      if (session?.roomCode && session?.id) {
        console.log("Found session, attempting reconnect...", session);
        setIsReconnecting(true);
        socket.emit("reconnect-player", session.roomCode, session.id, session.isHost);
      } else {
        setIsLoading(false); // No session, ready to join/create
      }
    };

    // 2. Define Handlers
    const onSessionReconnected = (game) => {
        console.log("Session Reconnected:", game);
        const storedSession = JSON.parse(localStorage.getItem("bingo-session"));
        
        setRoomCode(game.roomCode);
        setHost(prev => ({
            ...prev,
            id: game.hostId,
            isHost: storedSession?.isHost || false,
            hostName: game.hostName,
            cardNumber: game.cardNumber,
            cardWinningPattern: game.cardWinningPattern,
            numberCalled: game.numberCalled,
            players: game.players,
            winners: game.winners
        }));

        if(game.theme) setTheme(game.theme);

        // Calculate missing numbers
        const calledSet = new Set(game.numberCalled);
        const remaining = Array.from({length: 75}, (_, i) => i+1).filter(n => !calledSet.has(n));
        const lastCall = game.numberCalled.length > 1 ? game.numberCalled[game.numberCalled.length - 1] : null;
        
        setBingoNumbers({ array: remaining, randomNumber: lastCall });
        setDisplayNumber(lastCall);

        if (storedSession && !storedSession.isHost) {
            const me = game.players.find(p => p.id === storedSession.id);
            if (me) setPlayer(me);
        }

        setIsLoading(false);
        setIsReconnecting(false);
    };

    const onReconnectFailed = (msg) => {
        console.warn("Reconnect failed:", msg);
        localStorage.removeItem("bingo-session"); // Clear bad session
        setIsLoading(false);
        setIsReconnecting(false);
    };

    const onShuffling = (num) => {
        setIsShuffling(true);
        setDisplayNumber(num);
    };

    const onNumberCalled = (fullList) => {
        setIsShuffling(false);
        const lastNum = fullList[fullList.length - 1];
        setDisplayNumber(lastNum);
        
        setHost(prev => ({ ...prev, numberCalled: fullList }));
        setBingoNumbers(prev => ({
            randomNumber: lastNum,
            array: prev.array.filter(n => n !== lastNum)
        }));
    };

    const onPlayersUpdate = (players) => {
        setHost(prev => ({ ...prev, players }));
        // If I am a player, update my local state to match server (marks, etc)
        // Check `player.id` from state closure or ref is tricky here, 
        // relying on `player` dependency in a separate effect is better,
        // BUT we need to ensure we don't overwrite optimistic updates incorrectly.
        // For now, Host updates `players` list, individual `player` update handled by specific events or effect below.
    };

    const onPlayersWon = (winners) => {
        setHost(prev => ({ ...prev, winners }));
        // Logic for checking if 'I' won is handled in UI or derived state
        const myId = JSON.parse(localStorage.getItem("bingo-session"))?.id;
        const amIWinner = winners.some(w => w.id === myId);
        
        setShowConfetti(amIWinner);
        const names = winners.map(w => w.name).join(", ");
        setWinMessage(amIWinner ? (winners.length > 1 ? "BINGO! You and others won!" : "BINGO! You Won!") : `${names} Won!`);
    };

    const onGameReset = (game) => {
        setShowConfetti(false);
        setDisplayNumber(null);
        setBingoNumbers(initialBingoNumbers);
        setWinMessage("");
        setHost(prev => ({
            ...prev,
            numberCalled: game.numberCalled,
            winners: game.winners,
            players: game.players
        }));
        
        // If not host, show modal
        const isHost = JSON.parse(localStorage.getItem("bingo-session"))?.isHost;
        if(!isHost) setIsNewGameModalVisible(true);
    };

    // 3. Bind Events
    socket.on("connect", attemptReconnect);
    socket.on("session-reconnected", onSessionReconnected);
    socket.on("reconnect-failed", onReconnectFailed);
    socket.on("shuffling", onShuffling);
    socket.on("number-called", onNumberCalled);
    socket.on("players", onPlayersUpdate);
    socket.on("players-won", onPlayersWon);
    socket.on("game-reset", onGameReset);
    socket.on("theme-updated", (t) => setTheme(t));
    socket.on("winning-pattern-updated", (p) => setHost(prev => ({...prev, cardWinningPattern: p})));
    socket.on("card-refreshed", (cards) => setPlayer(prev => ({ ...prev, cards })));

    // Initial check (in case socket already connected)
    if(socket.connected) attemptReconnect();

    return () => {
        socket.off("connect", attemptReconnect);
        socket.off("session-reconnected", onSessionReconnected);
        socket.off("reconnect-failed", onReconnectFailed);
        socket.off("shuffling", onShuffling);
        socket.off("number-called", onNumberCalled);
        socket.off("players", onPlayersUpdate);
        socket.off("players-won", onPlayersWon);
        socket.off("game-reset", onGameReset);
        socket.off("theme-updated");
        socket.off("winning-pattern-updated");
        socket.off("card-refreshed");
    };
  }, []); // Run ONCE on mount

  // Sync Player Object when Host.players updates
  useEffect(() => {
    if (host.players.length > 0 && player.id) {
        const myData = host.players.find(p => p.id === player.id);
        if (myData) {
            // Only update if data actually changed to prevent render loops
            setPlayer(prev => {
                if (JSON.stringify(prev.markedNumbers) !== JSON.stringify(myData.markedNumbers) || 
                    JSON.stringify(prev.result) !== JSON.stringify(myData.result) ||
                    JSON.stringify(prev.cards) !== JSON.stringify(myData.cards)) {
                    return { ...prev, ...myData };
                }
                return prev;
            });
        }
    }
  }, [host.players, player.id]);

  // Save Session
  useEffect(() => {
    if (roomCode && (host.isHost || player.id)) {
        localStorage.setItem("bingo-session", JSON.stringify({
            roomCode,
            id: host.isHost ? host.id : player.id,
            isHost: host.isHost
        }));
    }
  }, [roomCode, host.isHost, host.id, player.id]);

  const value = useMemo(() => ({
    roomCode, setRoomCode,
    isOpenModal, setIsOpenModal,
    isLoading, isReconnecting,
    host, setHost,
    player, setPlayer,
    bingoNumbers, setBingoNumbers,
    winMessage, setWinMessage,
    isNewGameModalVisible, setIsNewGameModalVisible,
    isHostLeftModalVisible, setIsHostLeftModalVisible,
    showConfetti, setShowConfetti,
    confirmation, setConfirmation,
    isShuffling, displayNumber,
    theme, setTheme,
    resetGame
  }), [roomCode, isOpenModal, isLoading, isReconnecting, host, player, bingoNumbers, winMessage, isNewGameModalVisible, isHostLeftModalVisible, showConfetti, confirmation, isShuffling, displayNumber, theme, resetGame]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export default GameProvider;