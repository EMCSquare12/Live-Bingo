// src/pages/Lobby/HostRoom.jsx
import { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function HostRoom() {
  const { setIsOpenModal, host, setHost, setRoomCode, theme } =
    useContext(GameContext);
  const [isClickList, setIsClickList] = useState(false);
  const [errors, setErrors] = useState({}); // State to hold validation errors
  const listRef = useRef(null);
  const navigate = useNavigate();

  // A small preview for the winning pattern
  const PatternPreview = ({ pattern }) => {
    return (
      <div className="grid grid-cols-5 gap-0.5 p-1 bg-gray-600 rounded-sm">
        {Array.from({ length: 25 }, (_, index) => {
          const row = Math.floor(index / 5);
          const col = index % 5;
          const colMajorIndex = col * 5 + row;
          const isSelected =
            (pattern && pattern.index.includes(colMajorIndex)) || index === 12;
          return (
            <div
              key={index}
              className={`w-3 h-3 rounded-sm ${
                isSelected ? "bg-blue-400" : "bg-gray-400/50"
              }`}
            ></div>
          );
        })}
      </div>
    );
  };

  // New validation function
  const validateInputs = () => {
    const newErrors = {};
    if (!host.hostName.trim()) {
      newErrors.hostName = "Host name cannot be empty.";
    }
    if (!host.cardWinningPattern.name) {
      newErrors.cardWinningPattern = "Please select a winning pattern.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hostGame = () => {
    if (!validateInputs()) {
      return; // Stop if validation fails
    }
    socket.emit(
      "create-room",
      host.hostName,
      host.cardNumber,
      host.cardWinningPattern,
      theme
    );
  };

  useEffect(() => {
    const handleRoomCreated = (roomCode, hostId) => {
      setRoomCode(roomCode);
      setHost((prev) => ({ ...prev, id: hostId, isHost: true }));
      navigate(`/${roomCode}`);
    };

    socket.on("room-created", handleRoomCreated);

    return () => {
      socket.off("room-created", handleRoomCreated);
    };
  }, [navigate, setHost, setRoomCode]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        hostGame();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [host, hostGame]); // Re-bind listener if host state changes

  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target)) {
      setIsClickList(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleCardNumber = (index) => {
    setIsClickList(false);
    setHost((prev) => ({
      ...prev,
      cardNumber: index + 1,
    }));
  };

  const handleCardPattern = (value) => {
    setErrors((prev) => ({ ...prev, cardWinningPattern: null })); // Clear error on selection
    if (value === "Blackout") {
      const newArr = Array.from({ length: 25 }, (_, index) => index);
      setHost((prev) => ({
        ...prev,
        cardWinningPattern: {
          ...prev.cardWinningPattern,
          name: "Blackout",
          index: newArr,
        },
      }));
    } else {
      setIsOpenModal(true);
    }
  };

  const handleOnchange = (value) => {
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, hostName: null }));
    }
    setHost((prev) => ({
      ...prev,
      hostName: value,
    }));
  };

  return (
    <div
      className={`flex justify-center w-full h-full md:justify-start ${
        theme.isTransparent ? "" : "bg-gray-900"
      }`}
    >
      <section
        className={`flex flex-col gap-4 px-8 mt-16 mb-16 md:px-16 py-4 md:mt-32 w-fit h-fit rounded-lg ${
          theme.isTransparent ? "glass-morphism" : ""
        }`}
      >
        <h1 className="text-lg font-medium md:text-2xl font-inter text-gray-50">
          Host a game
        </h1>

        <div className="flex flex-col gap-2 pb-6">
          <label
            htmlFor="name"
            className="font-normal text-gray-50 text-md w-fit font-inter"
          >
            Your Name
          </label>
          <input
            onChange={(e) => handleOnchange(e.target.value)}
            value={host.hostName}
            id="name"
            type="text"
            className={`h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter w-72 ${
              errors.hostName
                ? "ring-2 ring-red-500"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
          />
          {errors.hostName && (
            <p className="mt-1 text-xs text-red-500">{errors.hostName}</p>
          )}
        </div>
        <div className="flex flex-row gap-4 pb-6">
          <label
            htmlFor="cardNumber"
            className="flex items-center font-normal text-gray-50 text-md w-fit font-inter"
          >
            Number of card
          </label>
          <div className="relative flex flex-col items-center">
            <input
              onClick={() => setIsClickList(!isClickList)}
              value={host.cardNumber}
              readOnly
              id="cardNumber"
              type="text"
              className="w-20 h-10 text-center text-gray-700 bg-gray-100 rounded-md outline-none cursor-pointer font-inter focus:ring-2 focus:ring-blue-500"
            />
            {!isClickList && (
              <IoIosArrowDown
                onClick={() => setIsClickList(!isClickList)}
                className="absolute text-gray-600 transform -translate-y-1/2 cursor-pointer right-2 text-md top-1/2 "
              />
            )}
            {isClickList && (
              <IoIosArrowUp
                onClick={() => setIsClickList(!isClickList)}
                className="absolute text-gray-600 transform -translate-y-1/2 cursor-pointer right-2 text-md top-1/2 "
              />
            )}
            {isClickList && (
              <ul
                ref={listRef}
                className="absolute w-full mt-1 overflow-y-auto bg-gray-100 rounded-md shadow-md top-full min-h-40 max-h-44 hide-scrollbar"
              >
                {Array.from({ length: 10 }, (_, index) => (
                  <li
                    onClick={() => handleCardNumber(index)}
                    key={index}
                    className={`flex items-center justify-center h-8 text-gray-700 ${
                      host.cardNumber === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    } cursor-pointer text-md font-inter hover:bg-blue-500 hover:text-gray-100`}
                  >
                    {index + 1}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-4 pb-6">
          <label
            className={`font-normal text-md w-fit font-inter ${
              errors.cardWinningPattern ? "text-red-500" : "text-gray-50"
            }`}
          >
            Winning card pattern
          </label>
          <div className="flex flex-row items-stretch justify-start gap-4 w-fit">
            <label
              htmlFor="blackout"
              className={`flex flex-col items-start gap-2 p-3 border-2 rounded-md cursor-pointer transition-all ${
                host.cardWinningPattern.name === "Blackout"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-600 hover:border-blue-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  onClick={(e) => handleCardPattern(e.target.value)}
                  id="blackout"
                  type="radio"
                  value="Blackout"
                  name="cardPattern"
                  className="w-5 h-5 rounded-md outline-none accent-blue-500"
                  checked={host.cardWinningPattern.name === "Blackout"}
                />
                <span className="text-sm font-normal text-gray-50 w-fit font-inter">
                  Blackout
                </span>
              </div>
              <div className="grid grid-cols-5 gap-0.5 p-1 bg-gray-600 rounded-sm">
                {Array.from({ length: 25 }).map((_, index) => (
                  <div
                    key={index}
                    className="w-3 h-3 bg-blue-400 rounded-sm"
                  ></div>
                ))}
              </div>
            </label>

            <label
              htmlFor="customize"
              className={`flex flex-col items-start gap-2 p-3 border-2 rounded-md cursor-pointer transition-all ${
                host.cardWinningPattern.name &&
                host.cardWinningPattern.name !== "Blackout"
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-600 hover:border-blue-500"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  id="customize"
                  type="radio"
                  name="cardPattern"
                  value="Customize"
                  className="w-5 h-5 rounded-md outline-none accent-blue-500"
                  onClick={(e) => handleCardPattern(e.target.value)}
                  checked={
                    host.cardWinningPattern.name &&
                    host.cardWinningPattern.name !== "Blackout"
                  }
                />
                <span className="text-sm font-normal text-gray-50 w-fit font-inter">
                  {host.cardWinningPattern.name &&
                  host.cardWinningPattern.name !== "Blackout"
                    ? host.cardWinningPattern.name
                    : "Customize"}
                </span>
              </div>
              <PatternPreview pattern={host.cardWinningPattern} />
            </label>
          </div>

          {errors.cardWinningPattern && (
            <p className="mt-1 text-xs text-red-500">
              {errors.cardWinningPattern}
            </p>
          )}
        </div>
        <button
          onClick={hostGame}
          className="flex items-center justify-center w-full h-12 text-lg font-medium bg-blue-600 rounded-md text-gray-50 hover:bg-blue-700"
        >
          Host
        </button>
        <Link
          to="/theme"
          className="flex items-center justify-center w-full h-12 mt-2 text-lg font-medium bg-purple-600 rounded-md text-gray-50 hover:bg-purple-700"
        >
          Customize Theme
        </Link>
        <div className="flex items-center justify-center w-full gap-1 mt-4 font-normal text-gray-400 font-inter text-md">
          Joining a game?{" "}
          <Link className="text-blue-400" to={"/"}>
            Enter room
          </Link>
        </div>
      </section>
    </div>
  );
}
export default HostRoom;