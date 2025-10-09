import { GiRoundStar } from "react-icons/gi";
import { FiRefreshCw } from "react-icons/fi";
import { useContext } from "react";
import GameContext from "../context/GameContext";

function BingoCard({ letterNumber, handleRefresh, markedNumbers, handleNumberClick }) {
  const { host } = useContext(GameContext);
  const isGameStarted = host.numberCalled && host.numberCalled.length > 1;

  const columns = [
    {
      label: "B",
      range: [1, 15],
      textColor: "text-blue-500",
    },
    {
      label: "I",
      range: [16, 30],
      textColor: "text-red-500",
    },
    {
      label: "N",
      range: [31, 45],
      textColor: "text-gray-400",
    },
    {
      label: "G",
      range: [46, 60],
      textColor: "text-green-500",
    },
    {
      label: "O",
      range: [61, 75],
      textColor: "text-yellow-500",
    },
  ];

  const getNumberColor = (number) => {
    const column = columns.find(
      (c) => number >= c.range[0] && number <= c.range[1]
    );
    return column ? column.textColor : "text-gray-600";
  };

  return (
    <div className="relative flex flex-col gap-4 p-4 overflow-hidden bg-gray-700 rounded-lg shadow-lg w-fit h-fit">
      <div className="absolute top-0 right-0 flex flex-row overflow-hidden bg-white rounded-bl-lg h-fit w-fit bg-opacity-20">
        <button
          onClick={handleRefresh}
          disabled={isGameStarted}
          className={`flex items-center justify-center h-6 p-1 px-2 text-md text-gray-50 ${
            isGameStarted
              ? "cursor-not-allowed text-gray-400"
              : "hover:bg-gray-400"
          }`}
        >
          <FiRefreshCw />
        </button>
        <button className="flex items-center justify-center h-6 p-1 px-2 font-medium text-md text-gray-50 hover:bg-gray-400">
          DIY
        </button>
      </div>
      <div className="grid grid-cols-5 grid-rows-1 gap-2 py-2 mt-4 rounded-md h-fit">
        {columns.map((col, index) => (
          <div
            key={index}
            className={`flex items-center justify-center w-12 text-4xl font-bold ${col.textColor}`}
          >
            {col.label}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 grid-rows-1 gap-2 rounded-md">
        {Object.keys(letterNumber).map((char, colIndex) => (
          <div
            key={colIndex}
            className="grid grid-cols-1 grid-rows-5 gap-2 rounded-md"
          >
            {letterNumber[char].map((num, rowIndex) => {
              const isCalled = host.numberCalled?.includes(num);
              const isMarked = markedNumbers.includes(num);
              return (
                <div
                  key={rowIndex}
                  onClick={() => handleNumberClick(num)}
                  className={`flex items-center justify-center w-12 h-12 text-xl font-bold  rounded-md font-inter ${
                    isCalled ? "cursor-pointer" : ""
                  } ${
                    isCalled && isMarked
                      ? "text-gray-50 bg-gray-500"
                      : `bg-gray-800 ${getNumberColor(num)}`
                  }`}
                >
                  {rowIndex === 2 && colIndex === 2 ? <GiRoundStar /> : num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
export default BingoCard;