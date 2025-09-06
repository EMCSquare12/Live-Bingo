import { useContext, useEffect } from "react";
import GameContext from "../../context/GameContext";
import { useLocation } from "react-router-dom";
import { socket } from "../../server/socket";

function Host() {
  const charStyle = {
    char: ["B", "I", "N", "G", "O"],
    styles: [
      "bg-blue-500",
      "bg-red-500",
      "bg-gray-300",
      "bg-green-500",
      "bg-yellow-500",
    ],
  };

  const { host, setHost, bingoNumbers, setBingoNumbers, roomCode } =
    useContext(GameContext);
  const location = useLocation();

  useEffect(() => {
    socket.on("players", (players) => {
      console.log(players);
      setHost((prev) => ({ ...prev, players }));
    });
    return () => {
      socket.off("players");
    };
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
      randomNumber: randomNumber,
      array: removedNumber,
    }));
  };
  useEffect(() => {
    socket.emit("roll-number", bingoNumbers.randomNumber, roomCode);
    console.log(bingoNumbers.array, bingoNumbers.randomNumber);
  }, [bingoNumbers.randomNumber]);

  return (
    <div className="flex flex-col items-center justify-between bg-gray-900">
      <div className="flex flex-row justify-start w-full gap-5 px-10">
        <h1 className="py-5 ml-5 font-medium text-md text-gray-50 font-inter w-fit">
          Host: {host.hostName?.toUpperCase()}
        </h1>
        <h1 className="py-5 font-medium text-md text-gray-50 font-inter w-fit">
          Room Code: {location.pathname.slice(1)}
        </h1>
      </div>
      <div className="grid  w-full h-auto grid-cols-[1fr_1.5fr_1fr] grid-rows-1 gap-10  px-10 pb-10 items-start">
        <div className="flex flex-col w-full min-h-[70%] rounded-xl bg-gray-600 aitems-center justify-between p-10 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-2">
            {bingoNumbers.randomNumber && (
              <div
                className={`flex items-center justify-center text-4xl font-bold ${
                  charStyle.styles[Math.floor(bingoNumbers.randomNumber / 15)]
                } rounded-lg text-gray-50 w-14 h-14 font-inter`}
              >
                {charStyle.char[Math.floor(bingoNumbers.randomNumber / 15)]}
              </div>
            )}
            <div className="w-full font-medium text-center text-9xl font-inter text-gray-50">
              {bingoNumbers.randomNumber || "X"}
            </div>
          </div>
          <button
            onClick={handleRollNumber}
            className="flex items-center justify-center px-6 py-2 mt-6 font-medium bg-blue-600 rounded-md text-gray-50 font-inter hover:bg-blue-700"
          >
            Roll Number
          </button>
        </div>

        <div className="flex flex-col items-start justify-start w-full p-10 bg-gray-600 shadow-lg h-fit rounded-xl">
          {Array.from({ length: 5 }, (_, charIndex) => (
            <div
              key={charIndex}
              className="flex flex-row items-start justify-center w-full gap-5 h-fit"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 mt-2 text-lg font-bold ${charStyle.styles[charIndex]} rounded-md text-gray-50 font-inter`}
              >
                {charStyle.char[charIndex]}
              </div>
              <div className="flex flex-wrap items-center w-full h-full gap-1 p-2 rounded-lg 0">
                {Array.from({ length: 15 }, (_, numIndex) => (
                  <div
                    key={numIndex}
                    className={`flex items-center justify-center text-sm font-medium text-center text-gray-50 rounded-md w-7 h-7 ${
                      bingoNumbers.array.includes(numIndex + charIndex * 15 + 1)
                        ? "bg-gray-500"
                        : `${charStyle.styles[charIndex]}`
                    }`}
                  >
                    {numIndex + charIndex * 15 + 1}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full h-[70%] rounded-xl bg-gray-600 shadow-lg">
          <h1 className="p-2 font-medium font-inter text-md text-gray-50 w-fit">
            Players:{" "}
            <span className="p-1 bg-gray-500 rounded">
              {host.players.length}{" "}
            </span>
          </h1>
          <ul className="flex flex-col gap-1 px-4 mt-2">
            {host.players.map((value, index) => (
              <li
                key={value.id || index}
                className="flex flex-row gap-6 text-sm font-normal text-gray-50 font-inter"
              >
                <div>{value.name}</div>
                <div>{value.result}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Host;
