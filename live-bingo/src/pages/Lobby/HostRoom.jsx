import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function HostRoom() {
  const { setIsOpenModal, host, setHost, setRoomCode } =
    useContext(GameContext);
  const [isClickList, setIsClickList] = useState(false);
  const [error, setError] = useState("");
  const nameRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const hostGame = useCallback(() => {
    if (!host.hostName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (host.cardWinningPattern.index.length === 0) {
      setError("Please select a winning pattern.");
      return;
    }
    setError(""); // Clear error if validation passes
    socket.emit(
      "create-room",
      host.hostName,
      host.cardNumber,
      host.cardWinningPattern
    );
    socket.once("room-created", (roomCode) => {
      setRoomCode(roomCode);
      // Navigate with state to indicate the user is the host
      navigate(`/${roomCode}`, { state: { isHost: true } });
    });
  }, [host, navigate, setRoomCode]);

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
  }, [hostGame]);

  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target)) {
      setIsClickList(false);
    }
  };
  useEffect(() => {
    const handleClick = () => setError("");
    document.addEventListener("mousedown", handleClickOutside);

    if (nameRef.current) {
      nameRef.current.addEventListener("click", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (nameRef.current) {
        nameRef.current.removeEventListener("click", handleClick);
      }
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
    setError("");
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
    if(error) setError("");
    setHost((prev) => ({
      ...prev,
      hostName: value,
    }));
  };

  return (
    <div className="flex justify-center w-full h-full bg-gray-900 md:justify-start">
      <section className="flex flex-col gap-4 px-8 mt-16 mb-16 md:px-16 md:mt-32 w-fit h-fit">
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
            ref={nameRef}
            onChange={(e) => handleOnchange(e.target.value)}
            value={host.hostName}
            id="name"
            type="text"
            className="h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter focus:ring-2 focus:ring-blue-500 w-72"
          />
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
        <div className="flex flex-col gap-2 pb-6">
          <label className="font-normal text-gray-50 text-md w-fit font-inter">
            Winning card pattern
          </label>
          <div className="flex flex-row items-center justify-center gap-2 w-fit">
            <input
              onClick={(e) => handleCardPattern(e.target.value)}
              id="blackout"
              type="radio"
              name="cardPattern"
              value="Blackout"
              className="w-5 h-5 rounded-md outline-none"
            />
            <label
              htmlFor="blackout"
              className="text-sm font-normal cursor-pointer text-gray-50 w-fit font-inter"
            >
              Blackout
            </label>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 mt-2 w-fit">
            <input
              id="customize"
              type="radio"
              name="cardPattern"
              value="Customize"
              className="w-5 h-5 rounded-md outline-none"
              onClick={(e) => handleCardPattern(e.target.value)}
            />
            <label
              htmlFor="customize"
              className="text-sm font-normal cursor-pointer text-gray-50 w-fit font-inter"
            >
              {host.cardWinningPattern.name || "Customize"}
            </label>
          </div>
        </div>
        {error && (
          <div className="flex justify-center w-full -mt-6 text-sm text-red-500 font-inter">
            {error}
          </div>
        )}
        <button
          onClick={hostGame}
          className="flex items-center justify-center w-full h-12 text-lg font-medium bg-blue-600 rounded-md text-gray-50 hover:bg-blue-700"
        >
          Host
        </button>
        <div className="flex items-center justify-center w-full gap-1 font-normal text-gray-400 font-inter text-md">
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

