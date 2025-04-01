import { useState, useEffect, useRef, useContext, use } from "react";
import { Await, data, Link } from "react-router-dom";
import GameContext from "../../context/GameContext";
import { io } from "socket.io-client";

function JoinRoom() {
  const [isEmpty, setIsEmpty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const roomIdRef = useRef(null);
  const nameRef = useRef(null);
  const { inputs, setInputs, roomCode, setRoomCode } = useContext(GameContext);
  const socket = io("http://localhost:3001");

  useEffect(() => {
    const handleClick = () => setIsEmpty(false);

    if (roomIdRef.current)
      roomIdRef.current.addEventListener("click", handleClick);
    if (nameRef.current) nameRef.current.addEventListener("click", handleClick);

    return () => {
      if (roomIdRef.current)
        roomIdRef.current.removeEventListener("click", handleClick);
      if (nameRef.current)
        nameRef.current.removeEventListener("click", handleClick);
    };
  }, []);

  const handleJoin = () => {
    if (!inputs.playerName && !roomCode) {
      setIsEmpty(true);
      return;
    }
  };

  useEffect(() => {
    if (!socket.connected) {
      socket.connect(); // Ensures only one connection
    }
    socket.on("create_game", (roomCode) => {
      setRoomCode(roomCode); // Store the generated room code
      console.log(roomCode);
    });
  }, []);

  const handleOnchange = (value) => {
    setInputs((prev) => ({ ...prev, playerName: value }));
  };
  return (
    <div className="flex justify-between w-full h-full bg-gray-900 over">
      <section className="flex flex-col gap-4 px-16 mt-32 mb-16 w-fit h-fit">
        <h1 className="text-lg font-medium md:text-2xl font-inter text-gray-50">
          Join a game
        </h1>
        <div className="flex flex-col gap-2 pb-6">
          <label
            htmlFor="roomCode"
            className="font-normal text-gray-50 text-md w-fit font-inter"
          >
            Room Code
          </label>
          <input
            ref={roomIdRef}
            // onChange={(e) => handleOnchange("roomCode", e.target.value)}
            // value={roomCode}
            id="roomCode"
            type="text"
            className="h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
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
            value={inputs.playerName}
            id="name"
            type="text"
            className="h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        {isEmpty && (
          <div className="flex justify-center w-full -mt-6 text-sm text-red-500 font-inter">
            Please enter room code
          </div>
        )}
        <button
          onClick={handleJoin}
          className="flex items-center justify-center w-full h-12 text-lg font-medium bg-blue-600 rounded-md text-gray-50 hover:bg-blue-700"
        >
          Join
        </button>
        <div className="flex items-center justify-center w-full gap-1 font-normal text-gray-400 font-inter text-md">
          Hosting a game?{" "}
          <Link
            className="text-blue-400"
            to={"/host"}
            // onClick={handleCreateRoom}
          >
            Create room
          </Link>
        </div>
      </section>
    </div>
  );
}
export default JoinRoom;
