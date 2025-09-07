import { GiRoundStar } from "react-icons/gi";
import { FiRefreshCw } from "react-icons/fi";
import { socket } from "../utils/socket";
import { useContext, useEffect, useState } from "react";
import GameContext from "../context/GameContext";
function BingoCard({ letterNumber, handleRefresh }) {
  const { host, setHost } = useContext(GameContext);
  const charStyle = [
    "text-blue-500",
    "text-red-500",
    "text-gray-300",
    "text-green-500",
    "text-yellow-500",
  ];

  useEffect(() => {
    const handleNumberCalled = (numberCalled) => {
      setHost((prev) => ({ ...prev, numberCalled }));
      console.log(numberCalled);
    };

    socket.on("number-called", handleNumberCalled);

    return () => {
      socket.off("number-called", handleNumberCalled);
    };
  }, []);

  return (
    <div className="relative flex flex-col gap-4 p-4 overflow-hidden bg-gray-600 rounded-lg shadow-lg w-fit h-fit">
      <div className="absolute top-0 right-0 flex flex-row overflow-hidden bg-white rounded-bl-lg h-fit w-fit bg-opacity-20">
        <button
          onClick={handleRefresh}
          className="flex items-center justify-center h-6 p-1 px-2 text-md text-gray-50 hover:bg-gray-400"
        >
          <FiRefreshCw />
        </button>
        <button className="flex items-center justify-center h-6 p-1 px-2 font-medium text-md text-gray-50 hover:bg-gray-400">
          DIY
        </button>
      </div>
      <div className="grid grid-cols-5 grid-rows-1 gap-2 py-2 mt-4 rounded-md h-fit">
        {Object.keys(letterNumber).map((char, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-12 text-4xl font-bold ${charStyle[index]}`}
          >
            {char}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 grid-rows-1 gap-2 rounded-md">
        {Object.keys(letterNumber).map((char, colIndex) => (
          <div
            key={colIndex}
            className="grid grid-cols-1 grid-rows-5 gap-2 rounded-md"
          >
            {letterNumber[char].map((num, rowIndex) => (
              <div
                key={rowIndex}
                className={`flex items-center justify-center w-12 h-12 text-xl font-bold  rounded-md font-inter ${
                  host.numberCalled?.includes(num)
                    ? "text-gray-50 bg-gray-500"
                    : "text-gray-600 bg-gray-50"
                }`}
              >
                {rowIndex === 2 && colIndex === 2 ? <GiRoundStar /> : num}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
export default BingoCard;
