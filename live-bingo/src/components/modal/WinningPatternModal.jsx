import { useContext, useEffect, useState } from "react";
import GameContext from "../../context/GameContext";
import { GiRoundStar } from "react-icons/gi";

const WinningPatternModal = () => {
  const { isOpenModal, setIsOpenModal, host, setHost } =
    useContext(GameContext);

  const handleCancel = () => {
    if (!host.cardWinningPattern.name) {
      setHost((prev) => ({
        ...prev,
        cardWinningPattern: (prev) => ({ ...prev, name: "Customize" }),
      }));
    }
    const newArr = Array.from({ length: 25 }, (_, index) => index);
    setHost((prev) => ({
      ...prev,
      cardWinningPattern: { ...prev.cardWinningPattern, index: newArr },
    }));
    setIsOpenModal(false);
  };

  const handleConfirm = () => {
    if (!host.cardWinningPattern.name) {
      setHost((prev) => ({
        ...prev,
        cardWinningPattern: {
          ...prev.cardWinningPattern,
          name: "Customize",
        },
      }));
    }
    setIsOpenModal(false);
  };

  const handlePattern = (index) => {
    setHost((prev) => {
      const exists = prev.cardWinningPattern.index.includes(index);

      return {
        ...prev,
        cardWinningPattern: {
          ...prev.cardWinningPattern,
          index: exists
            ? prev.cardWinningPattern.index.filter((i) => i !== index) // remove
            : [...prev.cardWinningPattern.index, index], // add
        },
      };
    });
    console.log(host.cardWinningPattern.index);
  };

  useEffect(() => {
    const handleEnterConfirm = (event) => {
      if (event.key === "Enter") {
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleEnterConfirm);

    return () => {
      window.removeEventListener("keydown", handleEnterConfirm);
    };
  }, [isOpenModal, handleConfirm]); // Now it reacts to state changes

  return (
    <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-opacity-25 bg-gray-50">
      <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg bg-gray-50">
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
          {Array.from({ length: 25 }, (_, index) => (
            <button
              onClick={() => handlePattern(index)}
              key={index}
              disabled={index === 12}
              className={`w-10 h-10 border-2 border-gray-600 rounded-md items-center justify-center flex text-gray-600 text-xl 
                ${
                  host.cardWinningPattern.index.includes(index) || index === 12
                    ? "bg-gray-600 text-gray-50"
                    : "bg-gray-50 text-gray-600"
                }
               `}
            >
              {index === 12 && <GiRoundStar className="text-gray-50" />}
            </button>
          ))}
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