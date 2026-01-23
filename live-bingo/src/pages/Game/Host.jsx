import { useContext, useEffect, useState } from "react";
import GameContext from "../../context/GameContext";
import { useLocation, Link } from "react-router-dom";
import { socket } from "../../utils/socket";

// SVG Icon Components (FaCopy, FaTrophy, FaUsers, FaSearch, FaChevronDown, HiX - Assuming these are defined as before)
// ... (Keep the SVG component definitions from the previous code) ...
const FaCopy = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const FaTrophy = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="inline-block w-5 h-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const FaUsers = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-gray-300" // Added text color
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
    />
  </svg>
);

const FaSearch = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="absolute w-4 h-4 text-gray-400 left-3 top-1/2 -translate-y-1/2 pointer-events-none" // Added pointer-events-none
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const FaChevronDown = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-5 h-5 text-gray-300" // Increased size slightly and added color
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

const HiX = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6" // Slightly larger close icon
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);


function Host() {
  const [copied, setCopied] = useState(false);
  const [openPlayerId, setOpenPlayerId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPlayersListOpen, setIsPlayersListOpen] = useState(false);
  const {
    isOpenModal,
    host,
    setHost,
    bingoNumbers,
    roomCode,
    isNewGameModalVisible,
    isShuffling,
    displayNumber,
    winMessage,
    theme,
  } = useContext(GameContext);
  const location = useLocation();

  const columns = [
    { label: "B", range: [1, 15] },
    { label: "I", range: [16, 30] },
    { label: "N", range: [31, 45] },
    { label: "G", range: [46, 60] },
    { label: "O", range: [61, 75] },
  ];

  // Effects (useEffect for player updates, roll number, key press) remain the same
  // ... (Keep existing useEffect hooks) ...
   useEffect(() => {
    const handlePlayersUpdate = (players) => {
      setHost((prev) => ({ ...prev, players }));
    };
    socket.on("players", handlePlayersUpdate);
    return () => {
      socket.off("players", handlePlayersUpdate);
    };
  }, [setHost]);

  const handleRollNumber = () => {
    socket.emit("request-new-number", roomCode);
  };

  const isRollDisabled =
    isNewGameModalVisible ||
    host.players.length < 1 ||
    bingoNumbers.array.length === 0 ||
    (host.winners && host.winners.length > 0) ||
    isShuffling ||
    winMessage;

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter" && !isRollDisabled) {
        handleRollNumber();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleRollNumber, isRollDisabled]);


  const handlePlayerClick = (playerId) => {
    setOpenPlayerId(openPlayerId === playerId ? null : playerId);
  };
  const filteredPlayers = host.players.filter((player) =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNumberStyle = (number) => {
    const column = columns.find(
      (c) => number >= c.range[0] && number <= c.range[1]
    );
    if (column) {
      return { backgroundColor: theme.columnColors[column.label] };
    }
    return { backgroundColor: "#6b7280" }; // gray-500
  };

  const finalRolledNumber = host.numberCalled.at(-1);
  const currentCol =
    !isShuffling && finalRolledNumber
      ? columns.find(
          (c) =>
            finalRolledNumber >= c.range[0] && finalRolledNumber <= c.range[1]
        )
      : null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(location.pathname.slice(1));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const sortedPlayers = [...filteredPlayers].sort(
    (a, b) => a.result.length - b.result.length
  );

  // Re-usable component for Players List content - Adjusted Search Bar container
  const PlayersListContent = () => (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 border-b border-gray-500 lg:border-b-0 lg:p-2 gap-2">
        <div className="flex flex-row items-center">
          <h1 className="font-medium text-gray-300 font-inter text-md w-fit">
            Players:{" "}
          </h1>{" "}
          <h1 className="flex items-center justify-center w-6 h-6 ml-2 font-medium text-gray-300 bg-gray-500 rounded text-md">
            {host.players.length}
          </h1>
        </div>
        {/* MODIFIED: Relative container and input width */}
        <div className="relative w-full sm:w-auto">
          <FaSearch />
          <input
            type="text"
            placeholder="Search Player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-8 px-2 pl-8 text-sm text-gray-300 bg-gray-700 rounded-md sm:w-40 focus:outline-none focus:ring-2 focus:ring-blue-500" // Full width on small, fixed on sm+
          />
        </div>
      </div>
      {host.winners && host.winners.length > 0 && (
        <div className="w-full px-4 py-2 mt-2 text-center bg-gray-700 rounded-lg mx-2 max-w-[calc(100%-1rem)]"> {/* Adjusted width slightly */}
          <h2 className="text-lg font-bold text-yellow-300">
            <FaTrophy />
            Winner(s)!
          </h2>
          <p className="text-white">
            {host.winners.map((w) => w.name).join(", ")}
          </p>
        </div>
      )}
      <ul className="flex flex-col gap-1 px-4 py-2 mt-2 overflow-y-auto max-h-80 md:max-h-96 hide-scrollbar"> {/* Adjusted max-h */}
        {sortedPlayers.map((player) => (
          <li
            key={player.id}
            className="flex flex-col p-2 text-sm font-normal text-gray-300 border-b border-gray-500 rounded-md cursor-pointer md:text-xs font-inter hover:bg-gray-500" // Increased text size slightly for mobile
            onClick={() => handlePlayerClick(player.id)}
          >
            <div className="flex flex-row items-center justify-between"> {/* Use justify-between */}
              <div className="flex items-center flex-grow gap-2 overflow-hidden whitespace-nowrap text-ellipsis"> {/* Allow name to take space */}
                <span>{player.name}</span>
              </div>
              <div className="flex items-center justify-center flex-shrink-0 w-8 h-fit"> {/* Fixed width for number */}
                {player.result.length}
              </div>
            </div>
            {openPlayerId === player.id && (
              <div className="p-2 mt-2 bg-gray-700 rounded-md">
                <p className="font-medium text-gray-400">Remaining Numbers:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {player.result
                    .sort((a, b) => a - b)
                    .map((num, index) => (
                      <span
                        key={index}
                        className={`flex items-center justify-center text-xs font-medium text-center text-gray-50 rounded-sm w-5 h-5`}
                        style={getNumberStyle(num)}
                      >
                        {num}
                      </span>
                    ))}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-start w-full min-h-screen relative">
      {isOpenModal && <WinningPatternModal />}
      <div className="flex flex-wrap items-center justify-center w-full gap-x-6 gap-y-2 px-4 pt-5 md:justify-between md:px-10">
        <h1 className="py-1 font-medium text-gray-300 text-md md:text-sm font-inter w-fit whitespace-nowrap">
          Host:{" "}
          <span className="text-gray-50 font-bold">
            {host.hostName?.toUpperCase()}
          </span>
        </h1>
        <h1 className="flex flex-row gap-2 py-1 font-medium text-gray-300 text-md md:text-sm font-inter w-fit">
          Room Code:{" "}
          <button
            onClick={handleCopy}
            className="relative flex flex-row items-center gap-1 font-bold text-gray-50 hover:text-gray-300 "
          >
            {location.pathname.slice(1)}
            <FaCopy />
            {copied && (
              <span className="absolute left-0 p-1 text-xs text-gray-300 bg-gray-600 bg-opacity-50 rounded-md w-fit -top-6">
                Copied
              </span>
            )}
          </button>
        </h1>
         <Link
          to="/theme"
          className="px-4 py-1.5 text-sm font-medium text-gray-100 bg-purple-600 rounded-md md:text-md font-inter hover:bg-purple-700" // Adjusted padding/size
        >
          Theme
        </Link>
      </div>

      {/* MODIFIED: Players Toggle (Mobile) - Enhanced Styling */}
      <div className="w-full px-4 mt-4 md:px-10 lg:hidden">
        <button
          onClick={() => setIsPlayersListOpen(true)}
          className={`flex items-center justify-between w-full p-3 rounded-lg shadow-lg ${
            theme.isTransparent ? "glass-morphism" : "bg-gray-700" // Darker background like image
          }`}
        >
          <div className="flex items-center gap-3"> {/* Increased gap */}
            <FaUsers /> {/* Icon added */}
            <span className="font-medium text-gray-300 font-inter text-md">
              Players:
            </span>
            <span className="flex items-center justify-center w-6 h-6 ml-1 font-medium text-gray-300 bg-gray-500 rounded text-md">
              {host.players.length}
            </span>
          </div>
          <FaChevronDown /> {/* Chevron added */}
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid w-full h-auto grid-cols-1 lg:grid-cols-[1fr_1.5fr_1fr] gap-6 md:gap-10 px-4 md:px-10 pb-10 items-start mt-4">
        {/* Column 1: Roll Number Box */}
        {/* Adjusted padding and font size */}
        <div
          className={`flex flex-col w-full min-h-[40vh] lg:min-h-[70%] rounded-xl items-center justify-between p-6 md:p-10 shadow-lg ${
            theme.isTransparent ? "glass-morphism" : "bg-gray-600"
          }`}
        >
          <div className="flex flex-col items-center justify-center flex-grow gap-2"> {/* Added flex-grow */}
            {currentCol && (
              <div
                className={`flex items-center justify-center text-3xl md:text-4xl font-bold rounded-lg text-gray-50 w-12 h-12 md:w-14 md:h-14 font-inter`}
                style={{ backgroundColor: theme.columnColors[currentCol.label] }}
              >
                {currentCol.label}
              </div>
            )}
            {/* Adjusted font size */}
            <div className="w-full font-medium text-center text-8xl font-inter text-gray-50">
              {displayNumber ?? "X"}
            </div>
          </div>
          <button
            onClick={handleRollNumber}
            disabled={isRollDisabled}
            className={`flex items-center justify-center px-8 py-3 mt-6 text-lg font-medium rounded-md text-gray-50 font-inter ${ // Larger button
              isRollDisabled
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            Roll Number
          </button>
          {host.players.length < 1 && !winMessage && (
            <p className="mt-2 text-sm text-center text-yellow-400"> {/* Slightly larger text */}
              Waiting for players to start.
            </p>
          )}
        </div>

        {/* Column 2: Bingo Board */}
        {/* Adjusted padding */}
        <div
          className={`flex flex-col items-start justify-start w-full p-4 shadow-lg h-fit rounded-xl ${
            theme.isTransparent ? "glass-morphism" : "bg-gray-600"
          }`}
        >
          {columns.map((col, charIndex) => (
            <div
              key={col.label}
              className="flex flex-row items-start justify-center w-full gap-2 md:gap-4 h-fit" // Slightly adjusted gap
            >
              <div
                className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 mt-2 text-lg md:text-xl font-bold rounded-md text-gray-50 font-inter`} // Slightly larger letter box
                style={{ backgroundColor: theme.columnColors[col.label] }}
              >
                {col.label}
              </div>
              <div className="flex flex-wrap items-center w-full h-full gap-1 p-1 md:p-2 rounded-lg"> {/* Reduced padding slightly */}
                {Array.from({ length: 15 }, (_, numIndex) => {
                  const number = numIndex + charIndex * 15 + 1;
                  const isAvailable = bingoNumbers.array.includes(number);
                  return (
                    <div
                      key={number}
                      className={`flex items-center justify-center text-xs md:text-sm font-medium text-center text-gray-50 rounded-md w-6 h-6 md:w-7 md:h-7`}
                      style={{
                        backgroundColor: isAvailable
                          ? "#6b7280" // gray-500
                          : theme.columnColors[col.label],
                      }}
                    >
                      {number}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Column 3: Players List (Desktop) */}
        <div
          className={`hidden lg:flex flex-col w-full h-[70vh] rounded-xl shadow-lg ${ // Used vh for height consistency
            theme.isTransparent ? "glass-morphism" : "bg-gray-600"
          }`}
        >
          <PlayersListContent />
        </div>
      </div>

      {/* Players List (Mobile/Tablet Overlay) - Adjusted max-height */}
      {isPlayersListOpen && (
        <div
          className="fixed inset-0 z-30 flex flex-col p-4 bg-gray-900 bg-opacity-75 lg:hidden backdrop-blur-sm"
          onClick={() => setIsPlayersListOpen(false)}
        >
          <div
            className={`relative flex flex-col w-full max-w-md mx-auto mt-16 rounded-xl shadow-lg overflow-hidden ${ // Added overflow-hidden
              theme.isTransparent ? "glass-morphism" : "bg-gray-700" // Matched button background
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsPlayersListOpen(false)}
              className="absolute top-2 right-2 p-2 text-gray-300 rounded-full hover:bg-gray-600 hover:text-white z-10" // Increased padding
            >
              <HiX />
            </button>
            {/* Added max-h for the content within overlay */}
            <div className="max-h-[70vh] overflow-y-auto">
               <PlayersListContent />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Host;