import { useState, useEffect, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

function JoinRoom() {
  const [isEmpty, setIsEmpty] = useState(false);
  const navigate = useNavigate();
  const roomIdRef = useRef(null);
  const nameRef = useRef(null);
  const { setRoomCode, roomCode, player, setPlayer, setHost } =
    useContext(GameContext);

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
    if (!player.name || !roomCode) {
      setIsEmpty(true);
      return;
    }
    socket.emit("join-room", player.name, roomCode);
    socket.once("joined-room", (joinedRoomCode, newPlayer) => {
      console.log("✅ joined-room received:", joinedRoomCode, newPlayer);
      setRoomCode(joinedRoomCode);
      setPlayer(newPlayer); // newPlayer now contains the persistent ID
      navigate(`/${joinedRoomCode}/${newPlayer.id}`);
    });
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
            onChange={(e) => setRoomCode(e.target.value)}
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
            onChange={(e) =>
              setPlayer((prev) => ({ ...prev, name: e.target.value }))
            }
            ref={nameRef}
            id="name"
            type="text"
            className="h-10 px-4 text-gray-700 bg-gray-100 rounded-md outline-none font-inter focus:ring-2 focus:ring-blue-500 w-72"
          />
        </div>
        {isEmpty && (
          <div className="flex justify-center w-full -mt-6 text-sm text-red-500 font-inter">
            Please enter room code and name
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
