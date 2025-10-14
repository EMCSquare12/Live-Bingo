import Logo from "./Logo.jsx";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import WinningPatternCard from "./WinningPatternCard.jsx";
import GameContext from "../context/GameContext.js";
import { socket } from "../utils/socket.js";

// SVG Icon Components to replace react-icons
const MdVolumeUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="text-xl"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
    />
  </svg>
);

const MdVolumeOff = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="text-xl"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
      clipRule="evenodd"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M17 14l2-2m0 0l2-2m-2 2L17 10"
    />
  </svg>
);

const FaCaretUp = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

const FaCaretDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

function Header() {
  const navigate = useNavigate();
  const [isClickSound, setIsClickSound] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const dropdownRef = useRef(null); // Create a ref for the dropdown menu

  const {
    setIsOpenModal,
    isOpenModal,
    host,
    resetGame,
    roomCode,
    setConfirmation,
    theme,
  } = useContext(GameContext);

  // This effect adds an event listener to detect clicks outside the dropdown.
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsClicked(false); // Close the dropdown if click is outside
      }
    };

    // Add the event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Remove the event listener when the component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleNewGameClick = () => {
    setConfirmation({
      isOpen: true,
      message:
        "Are you sure you want to start a new game? This will reset the current board.",
      onConfirm: () => {
        if (roomCode) {
          socket.emit("new-game", roomCode);
        }
        setConfirmation({ isOpen: false }); // Close modal on confirm
      },
      onCancel: () => {
        setConfirmation({ isOpen: false }); // Close modal on cancel
      },
    });
  };

  const handleLeaveGameClick = () => {
    setConfirmation({
      isOpen: true,
      message: "Are you sure you want to leave the game?",
      onConfirm: () => {
        if (!host.isHost) {
          const timeout = setTimeout(() => {
            resetGame();
            navigate("/");
          }, 5000); // 5 seconds timeout

          socket.once("leave-acknowledged", () => {
            clearTimeout(timeout);
            resetGame();
            navigate("/");
          });
          socket.emit("leave-game");
        } else {
          // Immediately reset the game state and navigate for the host
          resetGame();
          navigate("/");
          socket.emit("host-leave", roomCode);
        }
        setConfirmation({ isOpen: false });
      },
      onCancel: () => {
        setConfirmation({ isOpen: false });
      },
    });
  };

  const isGameStarted = host.numberCalled && host.numberCalled.length > 0;

  return (
    <>
      <div className={`flex justify-between w-screen px-2 py-3 border-b border-gray-900 h-fit md:px-8 ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-800'}`}>
        <Logo />
        <div className="relative z-10 flex items-center justify-center gap-2 px-3 -mt-2 -mb-2 font-medium text-gray-300 w-fit text-md font-inter ">
          Winning Pattern:{" "}
          <span
            onClick={() => setIsClicked(!isClicked)}
            className="flex items-center h-full gap-1 p-2 cursor-pointer hover:bg-gray-700"
          >
            {host.cardWinningPattern.name || "Customize"}
            {isClicked ? <FaCaretUp /> : <FaCaretDown />}
          </span>
          {isClicked && !isOpenModal ? (
            <div
              ref={dropdownRef} // Attach the ref to the dropdown container
              className={`absolute flex flex-col items-center justify-center p-4 transform -translate-x-1/2 rounded-md shadow-lg left-1/2 top-full w-60 ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-50'}`}
            >
              <WinningPatternCard />
              {host.isHost && (
                <button
                  onClick={() => {
                    setIsOpenModal(true);
                    setIsClicked(false); // Also close dropdown when opening modal
                  }}
                  disabled={isGameStarted}
                  className="mt-2 text-blue-600 underline text-md font-inter hover:text-blue-700 disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  Change
                </button>
              )}
            </div>
          ) : null}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setIsClickSound(!isClickSound)}
            className="flex items-center justify-center gap-1 px-3 font-medium text-gray-400 text-md font-inter hover:rounded-md hover:text-gray-100 hover:bg-gray-700"
          >
            {isClickSound ? <MdVolumeOff /> : <MdVolumeUp />}
          </button>

          {host.isHost && (
            <button
              onClick={handleNewGameClick}
              className="px-3 font-medium text-gray-100 bg-blue-600 rounded-md text-md font-inter hover:bg-blue-700"
            >
              New game
            </button>
          )}

          <button
            onClick={handleLeaveGameClick}
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