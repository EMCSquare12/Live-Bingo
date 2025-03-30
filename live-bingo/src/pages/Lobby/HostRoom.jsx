import { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";
import GameContext from "../../context/GameContext";
import { io } from "socket.io-client";

function HostRoom() {
  const { setIsOpenModal, pattern, setPattern, inputs, setInputs, roomCode } =
    useContext(GameContext);

  const [isClickList, setIsClickList] = useState(false);
  const [isEmpty, setIsEmpty] = useState(false);
  const [label, setLabel] = useState("");
  const nameRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const socket = io("http://localhost:3001");

  const hostGame = async () => {
    if (!inputs.hostName) {
      setIsEmpty(true);
      return;
    }

    socket.emit("create_game", inputs.hostName);

    navigate(`/${roomCode}`);
  };

  const handleClickOutside = (event) => {
    if (listRef.current && !listRef.current.contains(event.target)) {
      setIsClickList(false);
    }
  };
  useEffect(() => {
    const handleClick = () => setIsEmpty(false);
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
    setInputs((prev) => ({
      ...prev,
      number: index + 1,
    }));
  };

  const handleBlackout = () => {
    const newArr = [...Array(25)].map((_, index) => index);
    setPattern((prev) => ({ ...prev, array: newArr }));
  };

  const handleCustomize = (label) => {
    setLabel(label);
    setIsOpenModal(true);
    setPattern((prev) => ({
      ...prev,
      name: "",
      array:
        prev.array.length === 25 && label === "customize" ? [] : prev.array,
    }));
    console.log(pattern.array);
  };

  const handleOnchange = (value) => {
    setInputs((prev) => ({
      ...prev,
      hostName: value,
    }));
    localStorage.setItem("hostName", value);
  };

  return (
    <div className="flex justify-start w-full h-full bg-gray-900 over">
      <section className="flex flex-col gap-4 px-16 mt-32 mb-16 w-fit h-fit">
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
            value={inputs.hostName}
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
              value={inputs.number}
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
                      inputs.number === index + 1
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
              onClick={handleBlackout}
              id="blackout"
              type="radio"
              value="blackout"
              name="cardPattern"
              className="w-5 h-5 rounded-md outline-none "
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
              value="customize"
              className="w-5 h-5 rounded-md outline-none"
              onClick={() => handleCustomize("customize")}
            />
            <label
              htmlFor="customize"
              className="text-sm font-normal cursor-pointer text-gray-50 w-fit font-inter"
            >
              {pattern.name}
            </label>
          </div>
        </div>
        {isEmpty && (
          <div className="flex justify-center w-full -mt-6 text-sm text-red-500 font-inter">
            Please enter host name
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
