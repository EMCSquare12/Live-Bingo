import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import GameContext from "../../context/GameContext";

function NoRoom() {
  const { resetGame } = useContext(GameContext);
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetGame();
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen bg-gray-900 text-gray-50">
      <h1 className="text-4xl font-bold">Room Not Found</h1>
      <p className="mt-4 text-lg text-center text-gray-300">
        The room you are looking for does not exist or your session has expired.
      </p>
      <button
        onClick={handleGoHome}
        className="px-6 py-2 mt-8 font-medium bg-blue-600 rounded-md hover:bg-blue-700"
      >
        Go to Homepage
      </button>
    </div>
  );
}

export default NoRoom;