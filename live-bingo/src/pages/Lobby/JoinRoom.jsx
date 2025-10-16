import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function JoinRoom() {
  const [errors, setErrors] = useState({});
  const [isJoining, setIsJoining] = useState(false);
  const navigate = useNavigate();
  const { setRoomCode, roomCode, player, setPlayer, setHost, setTheme, theme } =
    useContext(GameContext);

  // This effect hook handles the responses from the server after trying to join.
  useEffect(() => {
    const handleRoomNotFound = (message) => {
      setErrors((prev) => ({ ...prev, roomCode: message, type: "error" }));
      setIsJoining(false);
    };

    const handleGameStarted = (message) => {
      setErrors((prev) => ({ ...prev, roomCode: message, type: "warning" }));
      setIsJoining(false);
    };

    // This function is called if the server successfully joins the player to the room.
    const handleJoinedRoom = (joinedRoomCode, gameState) => {
      console.log("✅ joined-room received:", joinedRoomCode, gameState);
      const { newPlayer, ...hostState } = gameState;

      setRoomCode(joinedRoomCode);
      setPlayer(newPlayer);
      setHost({
        ...hostState,
        isHost: false,
      });
      if (gameState.theme) {
        setTheme(gameState.theme);
      }

      setIsJoining(false);
      navigate(`/${joinedRoomCode}/${newPlayer.id}`);
    };

    socket.on("room-not-found", handleRoomNotFound);
    socket.on("game-started", handleGameStarted);
    socket.on("joined-room", handleJoinedRoom);

    return () => {
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("game-started", handleGameStarted);
      socket.off("joined-room", handleJoinedRoom);
    };
  }, [navigate, setPlayer, setRoomCode, setHost, setTheme]);

  const validateInputs = () => {
    const newErrors = {};
    if (!roomCode.trim()) {
      newErrors.roomCode = "Room code is required.";
    }
    if (!player.name.trim()) {
      newErrors.name = "Your name is required.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleJoin = () => {
    if (!validateInputs()) {
      return;
    }
    setIsJoining(true);
    setErrors({});
    socket.emit("join-room", player.name, roomCode);
  };

  // Effect to handle 'Enter' key press
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent default form submission
        handleJoin();
      }
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [roomCode, player.name]); // Re-bind listener if these change

  const handleRoomCodeChange = (value) => {
    if (errors.roomCode) {
      setErrors((prev) => ({ ...prev, roomCode: null }));
    }
    setRoomCode(value.toUpperCase());
  };

  const handleNameChange = (value) => {
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
    setPlayer((prev) => ({ ...prev, name: value }));
  };

  const roomCodeErrorClass = errors.roomCode
    ? errors.type === "warning"
      ? "ring-2 ring-yellow-500"
      : "ring-2 ring-red-500"
    : "focus:ring-2 focus:ring-blue-500";
  const roomCodeTextClass = errors.roomCode
    ? errors.type === "warning"
      ? "text-yellow-500"
      : "text-red-500"
    : "";

  return (
    <div className={`flex justify-center w-full h-full md:justify-start ${theme.isTransparent ? '' : 'bg-gray-900'}`}>
      <section className={`flex flex-col gap-4 px-8 mt-16 py-4 mb-16 md:px-16 md:mt-32 w-fit h-fit rounded-lg ${theme.isTransparent ? 'glass-morphism' : ''}`}>
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
            onChange={(e) => handleRoomCodeChange(e.target.value)}
            id="roomCode"
            type="text"
            className={`h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter w-72 ${roomCodeErrorClass}`}
          />
          {errors.roomCode && (
            <p className={`mt-1 text-xs ${roomCodeTextClass}`}>
              {errors.roomCode}
            </p>
          )}
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
            onChange={(e) => handleNameChange(e.target.value)}
            id="name"
            type="text"
            className={`h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter w-72 ${
              errors.name
                ? "ring-2 ring-red-500"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-500">{errors.name}</p>
          )}
        </div>
        <button
          onClick={handleJoin}
          disabled={isJoining}
          className="flex items-center justify-center w-full h-12 text-lg font-medium bg-blue-600 rounded-md text-gray-50 hover:bg-blue-700 disabled:bg-gray-500 disabled:cursor-not-allowed"
        >
          {isJoining ? "Joining..." : "Join"}
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