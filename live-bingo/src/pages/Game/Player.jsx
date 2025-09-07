import { useContext, useState } from "react";
import BingoCard from "../../components/BingoCard";
import GameContext from "../../context/GameContext";

function Player() {
  const { player, bingoNumbers, host } = useContext(GameContext);
  const [isRefreshed, setIsRefreshed] = useState(false);
  const cards = player.cards ?? [];
  const last = host.numberCalled.at(-1);

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
  const col = columns.find((c) => last >= c.range[0] && last <= c.range[1]);

  console.log(bingoNumbers.randomNumber);
  return (
    <div className="grid w-full h-full min-h-screen grid-cols-[40%_60%] bg-gray-900 items-center justify-start ">
      <div className="bg-gray-800 h-full p-10 flex flex-col gap-6">
        <h1 className="font-medium text-md text-gray-300 font-inter -mt-5">
          Player: {player.name}
        </h1>
        <div className="flex flex-row items-center justify-center gap-6 border-t border-b border-gray-500 py-5">
          {last && col && (
            <div
              className={`flex items-center justify-center font-bold text-7xl ${col.bgColor}  rounded-lg text-gray-50 w-24 h-24 font-inter`}
            >
              {col.label}
            </div>
          )}

          <div className="w-fit font-medium text-center text-9xl font-inter text-gray-50">
            {last ?? "X"}
          </div>
        </div>
        <div>
          <h1 className="font-medium flex flex-col text-md text-gray-300 font-inter -mt-3">
            Number Called:
          </h1>
          <ul className="flex flex-col gap-2 w-full bg-gray-700 rounded-md p-1 mt-3">
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
      <div className="w-full h-screen flex items-start justify-center py-10 overflow-y-auto ">
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
              handleRefresh={() => setIsRefreshed(!isRefreshed)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;
