import { useState, useEffect, useRef, useContext, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function JoinRoom() {
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const roomIdRef = useRef(null);
  const nameRef = useRef(null);
  const { setRoomCode, roomCode, player, setPlayer, setHost } =
    useContext(GameContext);

  useEffect(() => {
    const handleClick = () => setError("");
    
    const nameInput = nameRef.current;
    const roomInput = roomIdRef.current;

    if (roomInput) roomInput.addEventListener("click", handleClick);
    if (nameInput) nameInput.addEventListener("click", handleClick);
    
    const handleError = (errorMessage) => {
        setError(errorMessage);
    };
    socket.on('error', handleError);


    return () => {
      if (roomInput) roomInput.removeEventListener("click", handleClick);
      if (nameInput) nameInput.removeEventListener("click", handleClick);
      socket.off('error', handleError);
    };
  }, []);

  const handleJoin = useCallback(() => {
    if (!player.name.trim() || !roomCode.trim()) {
      setError("Please enter room code and name.");
      return;
    }
    setError("");
    socket.emit("join-room", player.name, roomCode);
    socket.once("joined-room", (roomCode, player) => {
      console.log("✅ joined-room received:", roomCode, player);
      setRoomCode(roomCode);
      setPlayer(player);
      setHost((prev) => ({ ...prev, players: [...prev.players, player] }));
      navigate(`/${roomCode}/${player.id}`);
    });
  }, [player.name, roomCode, navigate, setRoomCode, setPlayer, setHost]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleJoin();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [handleJoin]);

  return (
    <div className="flex justify-center w-full h-full bg-gray-900 md:justify-start">
      <section className="flex flex-col gap-4 px-8 mt-16 mb-16 md:px-16 md:mt-32 w-fit h-fit">
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
            value={roomCode}
            onChange={(e) => {
                setRoomCode(e.target.value);
                if (error) setError("");
            }}
            ref={roomIdRef}
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
            value={player.name}
            onChange={(e) => {
                setPlayer((prev) => ({ ...prev, name: e.target.value }));
                if (error) setError("");
            }}
            ref={nameRef}
            id="name"
            type="text"
            className="h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        {error && (
          <div className="flex justify-center w-full -mt-6 text-sm text-red-500 font-inter">
            {error}
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
          <Link className="text-blue-400" to="/host">
            Create a room
          </Link>
        </div>
      </section>
    </div>
  );
}
export default JoinRoom;
