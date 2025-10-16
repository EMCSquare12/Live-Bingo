import { useContext, useEffect, useState } from "react";
import GameContext from "../../context/GameContext";
import { GiRoundStar } from "react-icons/gi";

const WinningPatternModal = () => {
  const { isOpenModal, setIsOpenModal, host, setHost, theme, roomCode }=
    useContext(GameContext);

  // Store the pattern on open, to revert on cancel
  const [initialPattern, setInitialPattern] = useState(host.cardWinningPattern);

  useEffect(() => {
    if (isOpenModal) {
      setInitialPattern(host.cardWinningPattern);
    }
  }, [isOpenModal, host.cardWinningPattern]);

  const handleCancel = () => {
    setHost((prev) => ({ ...prev, cardWinningPattern: initialPattern }));
    setIsOpenModal(false);
  };

const handleConfirm = () => {
    const finalPattern = {
      ...host.cardWinningPattern,
      name: host.cardWinningPattern.name || "Customize",
    };

    setHost((prev) => ({
      ...prev,
      cardWinningPattern: finalPattern,
    }));

    // 👇 Emit the update to the server
    if (roomCode) {
      socket.emit("update-winning-pattern", roomCode, finalPattern);
    }

    setIsOpenModal(false);
  };

  const handlePattern = (index) => {
    const row = Math.floor(index / 5);
    const col = index % 5;
    const colMajorIndex = col * 5 + row;

    setHost((prev) => {
      const exists = prev.cardWinningPattern.index.includes(colMajorIndex);

      return {
        ...prev,
        cardWinningPattern: {
          ...prev.cardWinningPattern,
          index: exists
            ? prev.cardWinningPattern.index.filter((i) => i !== colMajorIndex)
            : [...prev.cardWinningPattern.index, colMajorIndex],
        },
      };
    });
  };

  useEffect(() => {
    const handleEnterConfirm = (event) => {
      if (event.key === "Enter" && isOpenModal) {
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleEnterConfirm);

    return () => {
      window.removeEventListener("keydown", handleEnterConfirm);
    };
  }, [isOpenModal, handleConfirm]);

  return (
    <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-opacity-25 bg-gray-50">
      <div className={`flex flex-col gap-4 p-6 rounded-lg shadow-lg ${theme.isTransparent ? 'glass-morphism' : 'bg-gray-50'}`}>
        <div className="flex flex-col gap-1 rounded-md">
          <input
            value={host.cardWinningPattern.name}
            placeholder="Enter pattern name"
            onChange={(e) =>
              setHost((prev) => ({
                ...prev,
                cardWinningPattern: {
                  ...prev.cardWinningPattern,
                  name: e.target.value,
                },
              }))
            }
            id="patternName"
            type="text"
            className="w-full h-10 px-2 py-1 text-gray-600 bg-gray-200 rounded-md outline-gray-600 text-md font-inter"
          />
        </div>
        <div className="grid grid-cols-5 grid-rows-5 gap-2 p-4 bg-gray-200 rounded-md w-fit">
          {Array.from({ length: 25 }, (_, index) => {
            const row = Math.floor(index / 5);
            const col = index % 5;
            const colMajorIndex = col * 5 + row;
            return (
              <button
                onClick={() => handlePattern(index)}
                key={index}
                disabled={index === 12}
                className={`w-10 h-10 border-2 border-gray-600 rounded-md items-center justify-center flex text-gray-600 text-xl
                  ${
                    host.cardWinningPattern.index.includes(colMajorIndex) || index === 12
                      ? "bg-gray-600 text-gray-50"
                      : "bg-gray-50 text-gray-600"
                  }
                 `}
              >
                {index === 12 && <GiRoundStar className="text-gray-50" />}
              </button>
            )
          })}
        </div>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleConfirm}
            className="flex items-center justify-center p-1 px-3 font-medium bg-blue-600 rounded-md hover:bg-blue-700 text-gray-50 font-inter text-md"
          >
            Confirm
          </button>
          <button
            onClick={handleCancel}
            className="flex items-center justify-center p-1 px-3 font-medium bg-gray-500 rounded-md hover:bg-gray-600 text-gray-50 font-inter text-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
export default WinningPatternModal;