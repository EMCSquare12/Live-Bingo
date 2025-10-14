import { useContext } from "react";
import GameContext from "../../context/GameContext";

const WinnerModal = () => {
  const { winMessage, setWinMessage, theme } = useContext(GameContext);

  const handleClose = () => {
    setWinMessage(""); // Close the modal by clearing the message.
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-70">
      <div className={`flex flex-col items-center gap-6 p-10 text-center rounded-lg shadow-xl text-gray-50 ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-800'}`}>
        <h1 className="text-5xl font-bold text-yellow-400">BINGO!</h1>
        <p className="text-3xl font-bold text-white">
          {winMessage}
        </p>
        <button
          onClick={handleClose}
          className="px-6 py-2 mt-4 font-medium bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default WinnerModal;