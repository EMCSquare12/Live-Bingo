import { useContext, useEffect, useState } from "react";
import GameContext from "../../context/GameContext";
import { useLocation } from "react-router-dom";
import { socket } from "../../utils/socket";
import { FaCopy } from "react-icons/fa6";

function Host() {
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [copied, setCopied] = useState(false);
  const { host, setHost, bingoNumbers, setBingoNumbers, roomCode } =
    useContext(GameContext);
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
    socket.on("players", (players) => {
      setHost((prev) => ({ ...prev, players }));
    });
    return () => socket.off("players");
  }, []);

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
  }, [bingoNumbers.randomNumber]);

  const currentCol = bingoNumbers.randomNumber
    ? columns.find(
        (c) =>
          bingoNumbers.randomNumber >= c.range[0] &&
          bingoNumbers.randomNumber <= c.range[1]
      )
    : null;

  const handleCopy = async (code) => {
    try {
      await navigator.clipboard.writeText(location.pathname.slice(1));
      setCopied(true);

      // Reset copied state after 2s
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-between bg-gray-900">
      {/* Header */}
      <div className="flex flex-row justify-start w-full gap-5 px-10">
        <h1 className="py-5 ml-5 font-medium text-md text-gray-300 font-inter w-fit">
          Host:{" "}
          <span className="text-gray-50">{host.hostName?.toUpperCase()}</span>
        </h1>
        <h1 className="py-5 flex flex-row gap-2  font-medium text-md text-gray-300 font-inter w-fit">
          Room Code:{" "}
          <button
            onClick={handleCopy}
            className="flex flex-row items-center gap-1 text-gray-50 hover:text-gray-300 relative "
          >
            {location.pathname.slice(1)}
            <FaCopy className="w-4 h-4" />
            {copied && (
              <span className="w-fit absolute -top-6 left-0 text-xs text-gray-300 bg-gray-600 bg-opacity-50 p-1 rounded-md">
                Copied
              </span>
            )}
          </button>
        </h1>
      </div>

      {/* Main grid */}
      <div className="grid w-full h-auto grid-cols-[1fr_1.5fr_1fr] gap-10 px-10 pb-10 items-start">
        {/* Current roll */}
        <div className="flex flex-col w-full min-h-[70%] rounded-xl bg-gray-600 items-center justify-between p-10 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-2">
            {currentCol && (
              <div
                className={`flex items-center justify-center text-4xl font-bold ${currentCol.bgColor} rounded-lg text-gray-50 w-14 h-14 font-inter`}
              >
                {currentCol.label}
              </div>
            )}

            <div className="w-full font-medium text-center text-9xl font-inter text-gray-50">
              {bingoNumbers.randomNumber ?? "X"}
            </div>
          </div>

          <button
            onClick={handleRollNumber}
            className="flex items-center justify-center px-6 py-2 mt-6 font-medium bg-blue-600 rounded-md text-gray-50 font-inter hover:bg-blue-700"
          >
            Roll Number
          </button>
        </div>

        {/* Board */}
        <div className="flex flex-col items-start justify-start w-full p-10 bg-gray-600 shadow-lg h-fit rounded-xl">
          {columns.map((col, charIndex) => (
            <div
              key={col.label}
              className="flex flex-row items-start justify-center w-full gap-5 h-fit"
            >
              {/* Column Label */}
              <div
                className={`flex items-center justify-center w-10 h-10 mt-2 text-lg font-bold ${col.bgColor} rounded-md text-gray-50 font-inter`}
              >
                {col.label}
              </div>

              {/* Numbers */}
              <div className="flex flex-wrap items-center w-full h-full gap-1 p-2 rounded-lg">
                {Array.from({ length: 15 }, (_, numIndex) => {
                  const number = numIndex + charIndex * 15 + 1;
                  const isAvailable = bingoNumbers.array.includes(number);

                  return (
                    <div
                      key={number}
                      className={`flex items-center justify-center text-sm font-medium text-center text-gray-50 rounded-md w-7 h-7 ${
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

        {/* Players */}
        <div className="flex flex-col w-full h-[70%] rounded-xl bg-gray-600 shadow-lg">
          <div className="flex flex-row justify-start items-center">
            <h1 className="p-2 font-medium font-inter text-md text-gray-300 w-fit">
              Players:{" "}
            </h1>{" "}
            <h1 className=" bg-gray-500 font-medium  text-md text-gray-300 w-6 flex items-center justify-center h-6 rounded">
              {host.players.length}
            </h1>
          </div>
          <ul className="flex flex-col gap-1 px-4 mt-2">
            {host.players.map((player, index) => {
              const isOpen = selectedPlayer === index;

              return (
                <li
                  onClick={() => setSelectedPlayer(isOpen ? null : index)}
                  key={player.id || index}
                  className="flex flex-row gap-6 p-1 rounded-md text-xs font-normal border-b border-gray-500 cursor-pointer text-gray-300 font-inter hover:bg-gray-500"
                >
                  {/* Player Name */}
                  <div className="w-24">{player.name}</div>

                  {/* Result Count */}
                  <div className="flex items-start justify-center h-fit -ml-3 w-fit">
                    {player.result.length}
                  </div>

                  {/* Expand Results */}
                  {isOpen &&
                    columns.map((col) => (
                      <ul key={col.label} className="flex flex-col gap-2">
                        {player.result
                          .filter(
                            (num) => num >= col.range[0] && num <= col.range[1]
                          )
                          .map((num) => (
                            <li
                              key={num}
                              className={`flex w-full ${col.textColor}`}
                            >
                              {num}
                            </li>
                          ))}
                      </ul>
                    ))}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Host;
