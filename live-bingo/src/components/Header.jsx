import { MdVolumeUp } from "react-icons/md";
import { MdVolumeOff } from "react-icons/md";
import Logo from "./Logo";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Header() {
  const navigate = useNavigate();
  const [isClickSound, setIsClickSound] = useState(false);
  return (
    <>
      <div className="flex justify-between w-screen px-2 py-2 bg-gray-800 h-fit md:px-8">
        <Logo />
        <div className="flex gap-1">
          <button
            onClick={() => setIsClickSound(!isClickSound)}
            className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 inter md:text-lg hover:rounded-md hover:text-gray-100 hover:bg-gray-700"
          >
            {isClickSound && (
              <>
                <MdVolumeOff className="text-xl" /> Turn on sound
              </>
            )}
            {!isClickSound && (
              <>
                <MdVolumeUp className="text-xl" /> Turn off sound
              </>
            )}
          </button>
          <button
            onClick={() => {
              navigate("/");
            }}
            className="px-3 py-2 text-sm font-medium text-gray-400 inter md:text-lg hover:rounded-md hover:bg-gray-700 hover:text-gray-100"
          >
            Leave game
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;
