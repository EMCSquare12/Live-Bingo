import { useContext } from "react";
import GameContext from "../../context/GameContext";
import { socket } from "../../utils/socket";

const WinnerModal = () => {
  const { winner, setWinner } = useContext(GameContext);

  const handleClose = () => {
    setWinner(null); // This will just close the modal.
  };

  const isWinner = socket.id === winner?.id;

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-70">
      <div className="flex flex-col items-center gap-6 p-10 text-center bg-gray-800 rounded-lg shadow-xl text-gray-50">
        <h1 className="text-5xl font-bold text-yellow-400">BINGO!</h1>
        <p className="text-3xl">
          {isWinner ? (
            <span className="font-bold text-white">You are the winner!</span>
          ) : (
            <>
              <span className="font-bold text-white">{winner?.name}</span> wins the game!
            </>
          )}
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