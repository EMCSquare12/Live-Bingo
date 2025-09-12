import { useContext, useState } from "react";
import BingoCard from "../../components/BingoCard";
import GameContext from "../../context/GameContext";

function Player() {
  const { player, host } = useContext(GameContext);
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

  return (
    <div className="grid w-full h-full min-h-screen grid-cols-[40%_60%] bg-gray-900 items-start justify-start ">
      <div className="flex flex-col h-full gap-6 p-10 bg-gray-800">
        <h1 className="-mt-5 font-medium text-gray-300 text-md font-inter">
          Player: {player.name}
        </h1>
        <div className="flex flex-row items-center justify-center gap-6 py-5 border-t border-b border-gray-500">
          {last && col && (
            <div
              className={`flex items-center justify-center font-bold text-7xl ${col.bgColor}  rounded-lg text-gray-50 w-24 h-24 font-inter`}
            >
              {col.label}
            </div>
          )}

          <div className="font-medium text-center w-fit text-9xl font-inter text-gray-50">
            {last ?? "X"}
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
              handleRefresh={() => setIsRefreshed(!isRefreshed)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Player;