import { MdVolumeUp } from "react-icons/md";
import { MdVolumeOff } from "react-icons/md";
import { FaCaretDown } from "react-icons/fa";
import { FaCaretUp } from "react-icons/fa";
import Logo from "./Logo";
import { useNavigate, useParams } from "react-router-dom";
import { useContext, useState } from "react";
import WinningPatternCard from "./WinningPatternCard";
import GameContext from "../context/GameContext";
import { socket } from "../utils/socket";

function Header() {
  const navigate = useNavigate();
  const { roomCode, playerId } = useParams();
  const isHost = !playerId;
  const [isClickSound, setIsClickSound] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const { setIsOpenModal, isOpenModal, host } =
    useContext(GameContext);

  const handleNewGame = () => {
    socket.emit("new-game", roomCode);
  };

  return (
    <>
      <div className="flex justify-between w-screen px-2 py-2 bg-gray-800 border-b border-gray-900 h-fit md:px-8">
        <Logo />
        <div className="relative z-10 flex items-center justify-center gap-2 px-3 -mt-2 -mb-2 font-medium text-gray-300 w-fit text-md font-inter ">
          Winning Pattern:{" "}
          <span
            onClick={() => setIsClicked(!isClicked)}
            className="flex items-center h-full gap-1 p-2 hover:bg-gray-700"
          >
            {host.cardWinningPattern.name}
            {isClicked ? <FaCaretUp /> : <FaCaretDown />}
          </span>
          {isClicked && !isOpenModal ? (
            <div className="absolute flex flex-col items-center justify-center p-4 transform -translate-x-1/2 rounded-md shadow-lg left-1/2 top-full bg-gray-50 w-60">
              <WinningPatternCard />
              <button
                onClick={() => setIsOpenModal(true)}
                className="mt-2 text-blue-600 underline hover:text-blue-700 text-md font-inter"
              >
                Change
              </button>
            </div>
          ) : null}
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
          {isHost && (
            <button
              onClick={handleNewGame}
              className="px-3 font-medium text-gray-100 bg-blue-600 rounded-md text-md font-inter hover:bg-blue-700"
            >
              New game
            </button>
          )}
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