import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import GameContext from "../../context/GameContext";

const HostLeftModal = () => {
  const { resetGame, setIsHostLeftModalVisible } = useContext(GameContext);
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);

  const handleCloseAndRedirect = () => {
    setIsHostLeftModalVisible(false);
    resetGame();
    navigate("/");
  };

  useEffect(() => {
    if (countdown === 0) {
      handleCloseAndRedirect();
      return;
    }

    const timerId = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [countdown]);

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-70">
      <div className="flex flex-col items-center gap-6 p-10 text-center bg-gray-800 rounded-lg shadow-xl text-gray-50">
        <h1 className="text-4xl font-bold text-red-500">Host Left</h1>
        <p className="text-xl">The host has ended the game.</p>
        <p className="text-lg">Redirecting in {countdown}...</p>
        <button
          onClick={handleCloseAndRedirect}
          className="px-6 py-2 mt-2 font-medium bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Go to Homepage
        </button>
      </div>
    </div>
  );
};

export default HostLeftModal;