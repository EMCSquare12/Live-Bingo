import { useContext, useEffect, useState } from "react";
import GameContext from "../../context/GameContext";
import { useLocation } from "react-router-dom";
import { socket } from "../../utils/socket";

// SVG Icon Components to replace react-icons
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

const FaTrophy = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block w-5 h-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

function Host() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [copied, setCopied] = useState(false);
  const {
    host,
    setHost,
    bingoNumbers,
    setBingoNumbers,
    roomCode,
    isNewGameModalVisible,
  } = useContext(GameContext);
  const location = useLocation();

  const columns = [
    {
      label: "B",
      range: [1, 15],
      textColor: "text-blue-500",
      bgColor: "bg-blue-500",
    },
    {
      label: "I",
      range: [16, 30],
      textColor: "text-red-500",
      bgColor: "bg-red-500",
    },
    {
      label: "N",
      range: [31, 45],
      textColor: "text-gray-400",
      bgColor: "bg-gray-400",
    },
    {
      label: "G",
      range: [46, 60],
      textColor: "text-green-500",
      bgColor: "bg-green-500",
    },
    {
      label: "O",
      range: [61, 75],
      textColor: "text-yellow-500",
      bgColor: "bg-yellow-500",
    },
  ];

  useEffect(() => {
    const handlePlayersUpdate = (players) => {
      setHost((prev) => ({ ...prev, players }));
    };
    socket.on("players", handlePlayersUpdate);
    return () => {
      socket.off("players", handlePlayersUpdate);
    };
  }, [setHost]);

  const handleRollNumber = () => {
    if (bingoNumbers.array.length === 0) return;
    const randomNumber =
      bingoNumbers.array[Math.floor(Math.random() * bingoNumbers.array.length)];
    const removedNumber = bingoNumbers.array.filter(
      (num) => num !== randomNumber
    );
    setBingoNumbers((prev) => ({
      ...prev,
      randomNumber,
      array: removedNumber,
    }));
  };

  useEffect(() => {
    if (bingoNumbers.randomNumber) {
      socket.emit("roll-number", bingoNumbers.randomNumber, roomCode);
    }
  }, [bingoNumbers.randomNumber, roomCode]);

  const currentCol = bingoNumbers.randomNumber
    ? columns.find(
        (c) =>
          bingoNumbers.randomNumber >= c.range[0] &&
          bingoNumbers.randomNumber <= c.range[1]
      )
    : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(location.pathname.slice(1));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sortedPlayers = [...host.players].sort(
    (a, b) => a.result.length - b.result.length
  );

  const isRollDisabled =
    isNewGameModalVisible ||
    host.players.length < 1 ||
    (host.winners && host.winners.length > 0);

  return (
    <div className="flex flex-col items-center justify-between bg-gray-900">
      <div className="flex flex-col items-center w-full gap-2 px-4 md:flex-row md:justify-start md:gap-5 md:px-10">
        <h1 className="py-5 ml-5 font-medium text-gray-300 text-md font-inter w-fit">
          Host:{" "}
          <span className="text-gray-50">{host.hostName?.toUpperCase()}</span>
        </h1>
        <h1 className="flex flex-row gap-2 py-5 font-medium text-gray-300 text-md font-inter w-fit">
          Room Code:{" "}
          <button
            onClick={handleCopy}
            className="relative flex flex-row items-center gap-1 text-gray-50 hover:text-gray-300 "
          >
            {location.pathname.slice(1)}
            <FaCopy />
            {copied && (
              <span className="absolute left-0 p-1 text-xs text-gray-300 bg-gray-600 bg-opacity-50 rounded-md w-fit -top-6">
                Copied
              </span>
            )}
          </button>
        </h1>
      </div>
      <div className="grid w-full h-auto grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-10 px-4 md:px-10 pb-10 items-start">
        <div className="flex flex-col w-full min-h-[70%] rounded-xl bg-gray-600 items-center justify-between p-4 md:p-10 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-2">
            {currentCol && (
              <div
                className={`flex items-center justify-center text-3xl md:text-4xl font-bold ${currentCol.bgColor} rounded-lg text-gray-50 w-12 h-12 md:w-14 md:h-14 font-inter`}
              >
                {currentCol.label}
              </div>
            )}
            <div className="w-full font-medium text-center text-8xl md:text-9xl font-inter text-gray-50">
              {bingoNumbers.randomNumber ?? "X"}
            </div>
          </div>
          <button
            onClick={handleRollNumber}
            disabled={isRollDisabled}
            className={`flex items-center justify-center px-6 py-2 mt-6 font-medium rounded-md text-gray-50 font-inter ${
              isRollDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Roll Number
          </button>
          {host.players.length < 1 && (
            <p className="mt-2 text-xs text-center text-yellow-400">
              Waiting for players to start.
            </p>
          )}
        </div>
        <div className="flex flex-col items-start justify-start w-full p-4 bg-gray-600 shadow-lg md:p-10 h-fit rounded-xl">
          {columns.map((col, charIndex) => (
            <div
              key={col.label}
              className="flex flex-row items-start justify-center w-full gap-2 md:gap-5 h-fit"
            >
              <div
                className={`flex items-center justify-center w-8 h-8 mt-2 text-base md:text-lg font-bold ${col.bgColor} rounded-md text-gray-50 font-inter`}
              >
                {col.label}
              </div>
              <div className="flex flex-wrap items-center w-full h-full gap-1 p-2 rounded-lg">
                {Array.from({ length: 15 }, (_, numIndex) => {
                  const number = numIndex + charIndex * 15 + 1;
                  const isAvailable = bingoNumbers.array.includes(number);
                  return (
                    <div
                      key={number}
                      className={`flex items-center justify-center text-xs md:text-sm font-medium text-center text-gray-50 rounded-md w-6 h-6 md:w-7 md:h-7 ${
                        isAvailable ? "bg-gray-500" : col.bgColor
                      }`}
                    >
                      {number}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full h-[70%] rounded-xl bg-gray-600 shadow-lg">
          <div className="flex flex-row items-center justify-start">
            <h1 className="p-2 font-medium text-gray-300 font-inter text-md w-fit">
              Players:{" "}
            </h1>{" "}
            <h1 className="flex items-center justify-center w-6 h-6 font-medium text-gray-300 bg-gray-500 rounded text-md">
              {host.players.length}
            </h1>
          </div>
          {host.winners && host.winners.length > 0 && (
            <div className="w-full px-4 py-2 mt-2 text-center bg-gray-700 rounded-lg">
              <h2 className="text-lg font-bold text-yellow-300">
                <FaTrophy />
                Winner(s)!
              </h2>
              <p className="text-white">
                {host.winners.map((w) => w.name).join(", ")}
              </p>
            </div>
          )}
          <ul className="flex flex-col gap-1 px-4 mt-2 overflow-y-auto max-h-96 hide-scrollbar">
            {sortedPlayers.map((player) => (
              <li
                key={player.id}
                className="flex flex-row gap-6 p-1 text-xs font-normal text-gray-300 border-b border-gray-500 rounded-md cursor-pointer font-inter hover:bg-gray-500"
              >
                <div className="flex items-center w-24 gap-2">
                  <span>{player.name}</span>
                </div>
                <div className="flex items-start justify-center -ml-3 h-fit w-fit">
                  {player.result.length}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Host;
