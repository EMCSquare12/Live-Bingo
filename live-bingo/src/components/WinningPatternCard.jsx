import { useContext } from "react";
import { GiRoundStar } from "react-icons/gi";
import GameContext from "../context/GameContext";

function WinningPatternCard() {
  const { host } = useContext(GameContext);
  return (
    <>
      <div className="flex flex-col items-center justify-center text-gray-600 text-md font-inter">
        {host.cardWinningPattern.name}
      </div>
      <div className="grid grid-cols-5 grid-rows-5 gap-1 p-2 mt-2 bg-gray-200 rounded-md">
        {Array.from({ length: 25 }, (_, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          const colMajorIndex = col * 5 + row;
          return (
            <div
              key={index}
              className={`flex items-center justify-center w-8 h-8 border-2 border-gray-600  rounded-md ${
                host.cardWinningPattern.index.includes(colMajorIndex) || index === 12
                  ? "bg-gray-600"
                  : "bg-gray-50"
              }`}
            >
              {index === 12 ? <GiRoundStar /> : ""}
            </div>
          );
        })}
      </div>
    </>
  );
}
export default WinningPatternCard;