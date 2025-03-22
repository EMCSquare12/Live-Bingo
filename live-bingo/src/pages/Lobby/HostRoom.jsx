import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

function HostRoom() {
  const [inputs, setInputs] = useState({
    name: "",
    cardNumber: 1,
  });
  const [isEmpty, setIsEmpty] = useState(false);
  const [isClickList, setIsClickList] = useState(false);
  const nameRef = useRef(null);
  const listRef = useRef(null);

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

  const handleOnchange = (key, value) => {
    setInputs((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleJoin = () => {
    if (!inputs.name) {
      setIsEmpty(true);
    }
  };
  return (
    <div className="flex justify-between w-full h-full bg-gray-900 over">
      <section className="flex flex-col gap-4 px-16 mt-40 mb-16 w-fit h-fit">
        <h1 className="text-lg font-medium md:text-2xl inter text-gray-50">
          Host a game
        </h1>

        <div className="flex flex-col gap-2 pb-6">
          <label
            htmlFor="name"
            className="font-normal text-gray-50 text-md w-fit inter"
          >
            Your Name
          </label>
          <input
            ref={nameRef}
            onChange={(e) => handleOnchange("name", e.target.value)}
            value={inputs.name}
            id="name"
            type="text"
            className="h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none inter focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        <div className="flex flex-row gap-4 pb-6">
          <label
            htmlFor="cardNumber"
            className="flex items-center font-normal text-gray-50 text-md w-fit inter"
          >
            Number of card
          </label>
          <div className="relative flex flex-col items-center">
            <input
              onClick={() => setIsClickList(!isClickList)}
              onChange={(e) => handleOnchange("cardNumber", e.target.value)}
              value={inputs.cardNumber}
              readOnly
              id="cardNumber"
              type="text"
              className="w-20 h-10 text-center text-gray-700 bg-gray-100 rounded-md outline-none cursor-pointer inter focus:ring-2 focus:ring-blue-500"
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
                    onClick={() => {
                      setInputs((prev) => ({
                        ...prev,
                        cardNumber: index + 1,
                      }));
                      setIsClickList(false);
                    }}
                    key={index}
                    className={`flex items-center justify-center h-8 text-gray-700 ${
                      inputs.cardNumber === index + 1
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100"
                    } cursor-pointer text-md inter hover:bg-blue-500 hover:text-gray-100`}
                  >
                    {index + 1}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 pb-6">
          <label className="font-normal text-gray-50 text-md w-fit inter">
            Winning card pattern
          </label>
          <div className="flex flex-row items-center justify-center gap-2 w-fit">
            <input
              id="blackout"
              type="radio"
              value="blackout"
              name="cardPattern"
              className="w-5 h-5 rounded-md outline-none "
            />
            <label
              htmlFor="blackout"
              className="text-sm font-normal cursor-pointer text-gray-50 w-fit inter"
            >
              Blackout
            </label>
          </div>
          <div className="flex flex-row items-center justify-center gap-2 mt-2 w-fit">
            <input
              id="custom"
              type="radio"
              name="cardPattern"
              value="custom"
              className="w-5 h-5 rounded-md outline-none"
            />
            <label
              htmlFor="custom"
              className="text-sm font-normal cursor-pointer text-gray-50 w-fit inter"
            >
              Customize
            </label>
          </div>
        </div>
        {isEmpty && (
          <div className="flex justify-center w-full -mt-6 text-sm text-red-500 inter">
            Please enter player name
          </div>
        )}
        <button
          onClick={handleJoin}
          className="flex items-center justify-center w-full h-12 text-lg font-medium bg-blue-600 rounded-md text-gray-50 hover:bg-blue-700"
        >
          Host
        </button>
        <div className="flex items-center justify-center w-full gap-1 font-normal text-gray-400 inter text-md">
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
