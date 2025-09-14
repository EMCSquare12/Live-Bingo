import { useState, useContext, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function JoinRoom() {
  const [errors, setErrors] = useState({}); // State for validation errors
  const [isJoining, setIsJoining] = useState(false); // State to handle submission status
  const navigate = useNavigate();
  const { setRoomCode, roomCode, player, setPlayer } = useContext(GameContext);

  // This effect hook handles the responses from the server after trying to join.
  useEffect(() => {
    // This function is called if the server says the room doesn't exist.
    const handleRoomNotFound = (message) => {
      setErrors((prev) => ({ ...prev, roomCode: message }));
      setIsJoining(false); // Re-enable the join button
    };

    // This function is called if the server successfully joins the player to the room.
    const handleJoinedRoom = (joinedRoomCode, newPlayer) => {
      console.log("✅ joined-room received:", joinedRoomCode, newPlayer);
      setRoomCode(joinedRoomCode);
      setPlayer(newPlayer);
      setIsJoining(false); // Re-enable on success before navigating
      navigate(`/${joinedRoomCode}/${newPlayer.id}`);
    };

    // We set up the listeners for both success and failure cases.
    socket.on("room-not-found", handleRoomNotFound);
    socket.on("joined-room", handleJoinedRoom);

    // Cleanup: This runs when the component is removed, preventing memory leaks.
    return () => {
      socket.off("room-not-found", handleRoomNotFound);
      socket.off("joined-room", handleJoinedRoom);
    };
  }, [navigate, setPlayer, setRoomCode]); // Dependencies ensure the hook has the latest functions.

  // Validates that the inputs are not empty.
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
      return; // Stop if client-side validation fails
    }
    setIsJoining(true); // Disable the button to prevent multiple clicks
    setErrors({}); // Clear previous errors on a new attempt
    socket.emit("join-room", player.name, roomCode);
  };

  const handleRoomCodeChange = (value) => {
    // Clear the error message when the user starts typing again.
    if (errors.roomCode) {
      setErrors((prev) => ({ ...prev, roomCode: null }));
    }
    // Automatically convert to uppercase for consistency with server
    setRoomCode(value.toUpperCase());
  };

  const handleNameChange = (value) => {
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: null }));
    }
    setPlayer((prev) => ({ ...prev, name: value }));
  };

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
            onChange={(e) => handleRoomCodeChange(e.target.value)}
            id="roomCode"
            type="text"
            className={`h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter w-72 ${
              errors.roomCode
                ? "ring-2 ring-red-500"
                : "focus:ring-2 focus:ring-blue-500"
            }`}
          />
          {errors.roomCode && (
            <p className="mt-1 text-xs text-red-500">{errors.roomCode}</p>
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
          disabled={isJoining} // Disable button while joining
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
