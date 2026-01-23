// src/components/Header.jsx
import Logo from "./Logo.jsx";
import { useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import WinningPatternCard from "./WinningPatternCard.jsx";
import GameContext from "../context/GameContext.js";
import { socket } from "../utils/socket.js";

// ... (SVGs remain unchanged, omitted for brevity but include them in your file) ...
const MdVolumeUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="text-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);
const MdVolumeOff = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="text-xl" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2L17 10" />
  </svg>
);
const FaCaretUp = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);
const FaCaretDown = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const HiMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);
const HiX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

function Header() {
  const navigate = useNavigate();
  const [isClickSound, setIsClickSound] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const mobileMenuRef = useRef(null);

  const {
    setIsOpenModal,
    isOpenModal,
    host,
    resetGame,
    roomCode,
    setConfirmation,
    theme,
  } = useContext(GameContext);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Logic to close dropdown when clicking outside
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsClicked(false);
      }
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        !event.target.closest("button[data-testid='mobile-menu-button']")
      ) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNewGameClick = () => {
    setConfirmation({
      isOpen: true,
      message:
        "Are you sure you want to start a new game? This will reset the current board.",
      onConfirm: () => {
        if (roomCode) {
          socket.emit("new-game", roomCode);
        }
        setConfirmation({ isOpen: false });
      },
      onCancel: () => {
        setConfirmation({ isOpen: false });
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
          }, 5000);

          socket.once("leave-acknowledged", () => {
            clearTimeout(timeout);
            resetGame();
            navigate("/");
          });
          socket.emit("leave-game");
        } else {
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

  // Determine if game has started to disable pattern changing
  const isGameStarted = host.numberCalled && host.numberCalled.some(num => num !== null);

  const handleOpenModal = () => {
    setIsOpenModal(true);
    setIsClicked(false); // Close the dropdown immediately
  };

  return (
    <>
      <div
        className={`relative z-20 flex items-center justify-between w-screen px-4 py-4 border-b border-gray-900 h-fit md:px-8 gap-4 ${
          theme.isTransparent ? "glass-morphism" : "bg-gray-800"
        }`}
      >
        <div className="flex-shrink-0">
          <Logo />
        </div>

        <div className="relative z-10 hidden md:flex items-center justify-center flex-grow gap-2 px-3 font-medium text-gray-300 text-md font-inter">
          Winning Pattern:{" "}
          <span
            onClick={() => setIsClicked(!isClicked)}
            className="flex items-center h-full gap-1 p-2 rounded cursor-pointer hover:bg-gray-700"
          >
            {host.cardWinningPattern.name || "Customize"}
            {isClicked ? <FaCaretUp /> : <FaCaretDown />}
          </span>
          {isClicked && !isOpenModal ? (
            <div
              ref={dropdownRef}
              className={`absolute z-10 flex flex-col items-center justify-center p-4 transform -translate-x-1/2 rounded-md shadow-lg left-1/2 top-full w-60 ${
                theme.isTransparent ? "glass-morphism" : "bg-gray-50"
              }`}
            >
              <WinningPatternCard />
              {host.isHost && (
                <button
                  type="button"
                  onClick={handleOpenModal}
                  disabled={isGameStarted}
                  className="mt-2 text-blue-600 underline text-md font-inter hover:text-blue-700 disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  Change
                </button>
              )}
            </div>
          ) : null}
        </div>

        <div className="flex items-center flex-shrink-0 gap-2 md:gap-3">
          <button
            onClick={() => setIsClickSound(!isClickSound)}
            className="hidden sm:flex items-center justify-center gap-1 p-2 font-medium text-gray-400 rounded-md text-md font-inter hover:text-gray-100 hover:bg-gray-700"
          >
            {isClickSound ? <MdVolumeOff /> : <MdVolumeUp />} 
          </button>

          {host.isHost && (
            <button
              onClick={handleNewGameClick}
              className="px-4 py-2 text-sm font-medium text-gray-100 bg-blue-600 rounded-md md:text-md font-inter hover:bg-blue-700"
            >
              New game
            </button>
          )}

          <button
            onClick={handleLeaveGameClick}
            className="hidden px-4 py-2 text-sm font-medium text-gray-400 md:block md:text-md font-inter hover:rounded-md hover:bg-gray-700 hover:text-gray-100"
          >
            Leave game
          </button>

          <div className="relative md:hidden">
            <button
              data-testid="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-400 rounded-md hover:text-gray-100 hover:bg-gray-700"
            >
              {isMobileMenuOpen ? <HiX /> : <HiMenu />}
            </button>

            {isMobileMenuOpen && (
              <div
                ref={mobileMenuRef}
                className={`absolute right-0 z-20 w-48 mt-2 origin-top-right rounded-md shadow-lg ${
                  theme.isTransparent ? "glass-morphism" : "bg-gray-800"
                }`}
              >
                <div
                  className="py-1"
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="mobile-menu-button"
                >
                   <button
                     onClick={() => {
                        setIsClicked(!isClicked);
                        setIsMobileMenuOpen(false);
                     }}
                    className="block w-full px-4 py-2 text-left text-gray-300 text-md font-inter hover:bg-gray-700 hover:text-gray-100"
                    role="menuitem"
                  >
                    Pattern: {host.cardWinningPattern.name || "Customize"}
                  </button>

                  <button
                    onClick={() => {
                      handleLeaveGameClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-gray-300 text-md font-inter hover:bg-gray-700 hover:text-gray-100"
                    role="menuitem"
                  >
                    Leave game
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative z-10 flex items-center justify-center py-2 border-b border-gray-700 md:hidden bg-gray-800/80 backdrop-blur-sm">
          <span className="font-medium text-gray-300 text-md font-inter">Winning Pattern:{" "}</span>
          <span
            onClick={() => setIsClicked(!isClicked)}
            className="flex items-center h-full gap-1 p-2 ml-1 rounded cursor-pointer text-gray-50 hover:bg-gray-700"
          >
            {host.cardWinningPattern.name || "Customize"}
            {isClicked ? <FaCaretUp /> : <FaCaretDown />}
          </span>
          {isClicked && !isOpenModal ? (
            <div
              ref={dropdownRef}
              className={`absolute z-20 flex flex-col items-center justify-center p-4 transform -translate-x-1/2 rounded-md shadow-lg left-1/2 top-full w-60 ${
                theme.isTransparent ? "glass-morphism" : "bg-gray-50"
              }`}
            >
              <WinningPatternCard />
              {host.isHost && (
                <button
                  type="button"
                  onClick={handleOpenModal}
                  disabled={isGameStarted}
                  className="mt-2 text-blue-600 underline text-md font-inter hover:text-blue-700 disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
                >
                  Change
                </button>
              )}
            </div>
          ) : null}
        </div>
    </>
  );
}

export default Header;