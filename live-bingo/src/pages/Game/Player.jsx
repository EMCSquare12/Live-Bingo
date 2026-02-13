// src/pages/Game/Player.jsx
import { useContext, useState, useEffect } from "react";
import BingoCard from "../../components/BingoCard";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function Player() {
  const {
    player,
    host,
    isShuffling,
    displayNumber,
    roomCode,
    setWinMessage,
    setShowConfetti,
    theme,
  } = useContext(GameContext);
  
  const [copied, setCopied] = useState(false);
  
  // Local state for instant feedback. 
  // We initialize it with server data, but we DON'T auto-sync it on every render 
  // to avoid overwriting optimistic updates with old server data.
  const [localMarkedNumbers, setLocalMarkedNumbers] = useState(player.markedNumbers || []);

  // Sync strictly when the GAME resets or player initially loads
useEffect(() => {
  if (player.markedNumbers) {
    setLocalMarkedNumbers(player.markedNumbers);
  }
}, [player.markedNumbers]);

  const cards = player.cards ?? [];

  const handleRefresh = (cardIndex) => {
    socket.emit("request-new-card", roomCode, player.id, cardIndex);
  };

  const handleNumberClick = (num) => {
    // 1. Validation: Has number been called?
    if (!host.numberCalled?.includes(num)) return;

    // 2. Optimistic Update
    const isMarked = localMarkedNumbers.includes(num);
    const newMarkedNumbers = isMarked
      ? localMarkedNumbers.filter((n) => n !== num)
      : [...localMarkedNumbers, num];
    
    setLocalMarkedNumbers(newMarkedNumbers);

    // 3. Send to Server
    socket.emit("mark-number", roomCode, player.id, newMarkedNumbers);

    // 4. Client-side Win Check (Optional, visual only)
    checkWinLocally(cards, newMarkedNumbers);
  };

  const checkWinLocally = (currentCards, currentMarks) => {
      const winningIndices = host.cardWinningPattern.index;
      for (const card of currentCards) {
        const cardNumbers = [...card.B, ...card.I, ...card.N, ...card.G, ...card.O];
        const required = winningIndices.map(idx => cardNumbers[idx]).filter(n => n !== null);
        
        if (required.length > 0 && required.every(n => currentMarks.includes(n))) {
            setShowConfetti(true);
            setWinMessage("BINGO! Checking server...");
            return;
        }
      }
  };

  // ... (Rest of the UI render logic remains similar to your original file, 
  // but using `localMarkedNumbers` passed to `BingoCard`) ...

  const FaCopy = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
    </svg>
  );

  const handleCopy = async () => {
     try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const finalRolledNumber = host.numberCalled.at(-1);
  const columns = [
    { label: "B", range: [1, 15] }, { label: "I", range: [16, 30] },
    { label: "N", range: [31, 45] }, { label: "G", range: [46, 60] }, { label: "O", range: [61, 75] },
  ];
  
  const col = !isShuffling && finalRolledNumber
      ? columns.find((c) => finalRolledNumber >= c.range[0] && finalRolledNumber <= c.range[1])
      : null;

  return (
    <div className="flex flex-col w-full min-h-screen md:grid md:grid-cols-[40%_60%] items-stretch justify-start">
      {/* Left Column */}
      <div className="flex flex-col w-full gap-4 p-4 md:h-full md:px-10 md:gap-6 md:order-1">
        <div className={`flex flex-row items-start justify-between w-full p-4 rounded-lg ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-800'}`}>
           <div className="flex gap-1 flex-col">
            <h1 className="font-medium text-gray-300 text-sm font-inter">Player: <span className="text-gray-50 font-bold">{player.name}</span></h1>
            <h1 className="font-medium text-gray-300 text-sm font-inter">Host: <span className="text-gray-50 font-bold">{host.hostName}</span></h1>
          </div>
          <div className="flex gap-1 flex-col items-start">
            <h1 className="flex flex-row items-center gap-2 font-medium text-gray-300 text-sm font-inter">
              Room Code: <button onClick={handleCopy} className="relative flex font-bold flex-row items-center gap-1 text-gray-50 hover:text-gray-300 ">{roomCode}<FaCopy />{copied && <span className="absolute left-0 p-1 text-xs text-gray-300 bg-gray-600 bg-opacity-50 rounded-md w-fit -bottom-6">Copied</span>}</button>
            </h1>
            <h1 className="font-medium text-gray-300 text-sm font-inter">Card Number: <span className="text-gray-50 font-bold">{host.cardNumber}</span></h1>
          </div>
        </div>

        <div className="flex flex-row items-stretch gap-4 md:flex-col md:items-start md:gap-6">
          <div className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg w-2/5 md:w-full md:flex-row md:py-5 ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-800'}`}>
             {col && <div className={`flex items-center justify-center font-bold text-3xl md:text-7xl rounded-lg text-gray-50 w-12 h-12 md:w-24 md:h-24 font-inter`} style={{ backgroundColor: theme.columnColors[col.label] }}>{col.label}</div>}
            <div className="w-fit text-center font-medium text-7xl md:text-9xl font-inter text-gray-50">{displayNumber ?? "X"}</div>
          </div>

          <div className={`flex flex-col w-3/5 md:hidden ${cards.length === 1 ? 'justify-center items-center' : 'items-center justify-start pt-1 overflow-y-auto max-h-60 hide-scrollbar'}`}>
            <div className={`flex flex-col w-fit h-fit gap-4`}>
                {cards.map((value, index) => (
                <BingoCard
                    key={index}
                    letterNumber={value}
                    handleRefresh={() => handleRefresh(index)}
                    markedNumbers={localMarkedNumbers} // Use local state
                    handleNumberClick={handleNumberClick}
                />
                ))}
            </div>
          </div>
        </div>

        <div className={`p-4 rounded-lg overflow-hidden ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-800'}`}>
          <h1 className="flex flex-col font-medium text-gray-300 text-md font-inter mb-2">Number Called:</h1>
          <div className="overflow-x-auto pb-2">
             <div className="inline-block min-w-full">
                <ul className={`flex flex-col w-full gap-1 p-1 rounded-md md:gap-2`}>
                   {columns.map(({ label, range }) => (
                    <li key={label} className="flex flex-row items-center gap-2 flex-nowrap">
                        <span className={`flex items-center justify-center text-2xl font-bold rounded-sm font-inter mr-2 w-6 flex-shrink-0`} style={{ color: theme.columnColors[label] }}>{label}</span>
                        <ul className="flex flex-row items-center flex-nowrap gap-2">
                          {host.numberCalled
                            .filter((value) => value >= range[0] && value <= range[1])
                            .sort((a, b) => a - b)
                            .map((value, index) => (
                              <li key={index} className={`flex items-center justify-center text-xs font-medium text-center text-gray-50 rounded-sm w-5 h-5 flex-shrink-0`} style={{ backgroundColor: theme.columnColors[label] }}>{value}</li>
                            ))}
                        </ul>
                    </li>
                  ))}
                </ul>
             </div>
          </div>
        </div>
      </div>

      {/* Right Column (Desktop) */}
      <div className="hidden md:flex items-start justify-center w-full p-4 md:h-screen md:py-10 md:overflow-y-auto md:order-2">
         <div className={`${cards.length < 2 ? "flex flex-col justify-center items-center " : "grid grid-cols-1 md:grid-cols-2 place-items-center "} w-full md:w-fit h-fit gap-4 md:gap-8 `}>
          {cards.map((value, index) => (
            <BingoCard
              key={index}
              letterNumber={value}
              handleRefresh={() => handleRefresh(index)}
              markedNumbers={localMarkedNumbers} // Use local state
              handleNumberClick={handleNumberClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;