import { useContext, useState, useEffect } from "react";
import GameContext from "../../context/GameContext";

const NewGameModal = () => {
  const { setIsNewGameModalVisible } = useContext(GameContext);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // When the countdown reaches zero, close the modal.
    if (countdown === 0) {
      setIsNewGameModalVisible(false);
      return;
    }

    // Set up a timer that decrements the countdown every second.
    const timerId = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    // Clean up the interval when the component unmounts or the countdown changes.
    return () => clearInterval(timerId);
  }, [countdown, setIsNewGameModalVisible]);


  const handleClose = () => {
    setIsNewGameModalVisible(false);
  };

  return (
    <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-70">
      <div className="flex flex-col items-center gap-6 p-10 text-center bg-gray-800 rounded-lg shadow-xl text-gray-50">
        <h1 className="text-4xl font-bold text-blue-400">New Game Starting!</h1>
        <p className="text-xl">
          The host has started a new round.
        </p>
        <div className="text-6xl font-bold text-white">
          {countdown}
        </div>
        <button
          onClick={handleClose}
          className="px-6 py-2 mt-2 font-medium bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default NewGameModal;