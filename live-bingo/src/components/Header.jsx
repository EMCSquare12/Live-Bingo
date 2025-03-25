import { MdVolumeUp } from "react-icons/md";
import { MdVolumeOff } from "react-icons/md";

import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import { use, useState } from "react";
import WinningPatternCard from "./WinningPatternCard";

function Header({ handleNewGame }) {
  const navigate = useNavigate();
  const [isClickSound, setIsClickSound] = useState(false);
  const [isMouseEnter, setIsMouseEnter] = useState(false);
  return (
    <>
      <div className="flex justify-between w-screen px-2 py-2 bg-gray-800 h-fit md:px-8">
        <Logo />
        <div
          onMouseEnter={() => setIsMouseEnter(true)}
          onMouseLeave={() => setIsMouseEnter(false)}
          className="relative z-10 flex items-center px-3 -mt-2 -mb-2 font-medium text-gray-100 w-fit text-md font-inter hover:bg-gray-700"
        >
          Winning Pattern: Blackout
          {isMouseEnter && (
            <div className="absolute left-0 flex flex-col items-center justify-center w-full p-4 rounded-md shadow-lg top-full bg-gray-50 ">
              <div className="text-gray-600 text-md font-inter">Blackout</div>
              <WinningPatternCard />
              <button className="mt-2 text-blue-600 underline hover:text-blue-700 text-md font-inter">
                Edit
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsClickSound(!isClickSound)}
            className="flex items-center justify-center gap-1 px-3 font-medium text-gray-400 text-md font-inter hover:rounded-md hover:text-gray-100 hover:bg-gray-700"
          >
            {isClickSound ? (
              <MdVolumeOff className="text-xl" />
            ) : (
              <MdVolumeUp className="text-xl" />
            )}
          </button>
          <button
            onClick={handleNewGame}
            className="px-3 font-medium text-gray-100 bg-blue-600 rounded-md text-md font-inter hover:bg-blue-700 "
          >
            New game
          </button>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="px-3 font-medium text-gray-400 text-md font-inter hover:rounded-md hover:bg-gray-700 hover:text-gray-100"
          >
            Leave game
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;
