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
  const cards = player.cards ?? [];
  const [markedNumbers, setMarkedNumbers] = useState(player.markedNumbers || []);

  useEffect(() => {
    setMarkedNumbers(player.markedNumbers || []);
  }, [player.markedNumbers]);

  const handleRefresh = (cardIndex) => {
    socket.emit("request-new-card", roomCode, player.id, cardIndex);
  };

  const handleNumberClick = (num) => {
    if (host.numberCalled?.includes(num)) {
      const newMarkedNumbers = markedNumbers.includes(num)
        ? markedNumbers.filter((n) => n !== num)
        : [...markedNumbers, num];
      setMarkedNumbers(newMarkedNumbers);
      socket.emit("mark-number", roomCode, player.id, newMarkedNumbers);

      // Optimistic win check
      const winningPatternIndices = host.cardWinningPattern.index;
      for (const card of player.cards) {
        const cardNumbers = [
          ...card.B,
          ...card.I,
          ...card.N,
          ...card.G,
          ...card.O,
        ];
        const requiredNumbers = winningPatternIndices
          .map((index) => cardNumbers[index])
          .filter((num) => num !== null);

        if (requiredNumbers.length > 0) {
          const isWinner = requiredNumbers.every((num) =>
            newMarkedNumbers.includes(num)
          );

          if (isWinner) {
            setShowConfetti(true);
            setWinMessage("BINGO! You are the winner!");
            break;
          }
        }
      }
    }
  };

  const columns = [
    {
      label: "B",
      range: [1, 15],
      textColor: " text-blue-500",
      bgColor: "bg-blue-500",
    },
    {
      label: "I",
      range: [16, 30],
      textColor: "text-red-500",
      bgColor: "bg-red-500 ",
    },
    {
      label: "N",
      range: [31, 45],
      textColor: "text-gray-400",
      bgColor: "bg-gray-400  ",
    },
    {
      label: "G",
      range: [46, 60],
      textColor: "text-green-500",
      bgColor: "bg-green-500  ",
    },
    {
      label: "O",
      range: [61, 75],
      textColor: "text-yellow-500",
      bgColor: "bg-yellow-500 ",
    },
  ];

  const FaCopy = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
      />
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
  const col =
    !isShuffling && finalRolledNumber
      ? columns.find(
          (c) =>
            finalRolledNumber >= c.range[0] && finalRolledNumber <= c.range[1]
        )
      : null;

  return (
 <div
      className="grid w-full h-full min-h-screen grid-cols-[40%_60%] items-start justify-start "
      style={{
        backgroundColor: theme.backgroundImage ? 'transparent' : theme.backgroundColor,
        backgroundImage: theme.backgroundImage ? `url(${theme.backgroundImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >     <div className="flex flex-col h-full gap-6 px-10 bg-gray-800">
        <div className="flex flex-row items-center justify-between w-full p-4 -mb-6">
           <div className="flex gap-1 flex-col">
            <h1 className="font-medium text-gray-300 text-sm font-inter">
            Player: <span className="text-gray-50 font-bold">{player.name}</span>
          </h1>
          <h1 className="font-medium text-gray-300 text-sm font-inter">
            Host: <span className="text-gray-50 font-bold">{host.hostName}</span>
          </h1>
          </div>
          <div className="flex gap-1 flex-col">
            <h1 className="flex flex-row items-center gap-2 font-medium text-gray-300 text-sm font-inter">
            Room Code:{" "}
            <button
              onClick={handleCopy}
              className="relative flex font-bold flex-row items-center gap-1 text-gray-50 hover:text-gray-300 "
            >
              {roomCode}
              <FaCopy />
              {copied && (
                <span className="absolute left-0 p-1 text-xs text-gray-300 bg-gray-600 bg-opacity-50 rounded-md w-fit -bottom-6">
                  Copied
                </span>
              )}
            </button>
          </h1>
          <h1 className="font-medium text-gray-300 text-sm font-inter">Card Number: <span className="text-gray-50 font-bold">{host.cardNumber}</span></h1>
          </div>
        </div>
        <div className="flex flex-row items-center justify-center gap-6 py-5 border-t border-b border-gray-500">
          {col && (
            <div
              className={`flex items-center justify-center font-bold text-7xl ${col.bgColor}  rounded-lg text-gray-50 w-24 h-24 font-inter`}
            >
              {col.label}
            </div>
          )}

          <div className="font-medium text-center w-fit text-9xl font-inter text-gray-50">
            {displayNumber ?? "X"}
          </div>
        </div>
        <div>
          <h1 className="flex flex-col -mt-3 font-medium text-gray-300 text-md font-inter">
            Number Called:
          </h1>
          <ul className="flex flex-col w-full gap-2 p-1 mt-3 bg-gray-700 rounded-md">
            {columns.map(({ label, range, textColor, bgColor }) => (
              <li key={label}>
                <ul className="flex flex-row items-center justify-start gap-2">
                  <span
                    className={`flex items-center justify-center text-2xl font-bold rounded-sm font-inter mr-4 w-6  ${textColor}`}
                  >
                    {label}
                  </span>
                  {host.numberCalled
                    .filter((value) => value >= range[0] && value <= range[1])
                    .sort((a, b) => a - b)
                    .map((value, index) => (
                      <li
                        key={index}
                        className={`flex items-center justify-center text-xs font-medium text-center text-gray-50 rounded-sm w-5 h-5 ${bgColor}`}
                      >
                        {value}
                      </li>
                    ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex items-start justify-center w-full h-screen py-10 overflow-y-auto ">
        <div
          className={`${
            cards.length < 2
              ? "flex justify-center  items-center "
              : "grid grid-cols-2  place-items-center "
          } w-fit h-fit gap-8 `}
        >
          {cards.map((value, index) => (
            <BingoCard
              key={index}
              letterNumber={value}
              handleRefresh={() => handleRefresh(index)}
              markedNumbers={markedNumbers}
              handleNumberClick={handleNumberClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;