import { useContext, useRef, useEffect, useState } from "react";
import GameContext from "../../context/GameContext";
import { GiRoundStar } from "react-icons/gi";

const WinningPatternModal = () => {
  const { isOpenModal, setIsOpenModal, pattern, setPattern } =
    useContext(GameContext);

  const [isMouseDown, setIsMouseDown] = useState(false);

  const handlePattern = (index) => {
    setPattern((prev) => {
      const updatedArray = prev.array.includes(index)
        ? prev.array.filter((item) => item !== index) // Remove index if it exists
        : [...prev.array, index]; // Add index if it doesn't exist

      return { ...prev, array: updatedArray };
    });
  };

  const handleMousePattern = (index) => {
    if (isMouseDown) {
      handlePattern(index);
    }
  };

  const handleCancel = () => {
    const newArray = Array.from({ length: 25 }, (_, index) => index);
    setIsOpenModal(false);
    setPattern((prev) => ({
      ...prev,
      name: "Customize",
      array: newArray,
    }));
  };

  const handleConfirm = () => {
    setPattern((prev) => ({
      ...prev,
      name: !prev.name ? "Customize" : prev.name,
    }));
    setIsOpenModal(false);
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

  // const handleClickOutside = (event) => {
  //   if (patternRef.current && !patternRef.current.contains(event.target)) {
  //     setIsOpenModal(false);
  //     setPattern((prev) => ({ ...prev, name: "Customize" }));
  //   }
  // };
  // useEffect(() => {
  //   document.addEventListener("mousedown", handleClickOutside);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, []);

  return (
    <div className="fixed top-0 left-0 z-20 flex items-center justify-center w-screen h-screen bg-opacity-25 bg-gray-50">
      <div className="flex flex-col gap-4 p-6 rounded-lg shadow-lg bg-gray-50">
        <div className="flex flex-col gap-1 rounded-md">
          {/* <label
            htmlFor="patternName"
            className="flex items-center text-gray-600 text-md font-inter"
          >
            Pattern Name:
          </label> */}
          <input
            value={pattern.name}
            placeholder="Enter pattern name"
            onChange={(e) =>
              setPattern((prev) => ({ ...prev, name: e.target.value }))
            }
            id="patternName"
            type="text"
            className="w-full h-10 px-2 py-1 text-gray-600 bg-gray-200 rounded-md outline-gray-600 text-md font-inter"
          />
        </div>
        <div className="grid grid-cols-5 grid-rows-5 gap-2 p-4 bg-gray-200 rounded-md w-fit">
          {Array.from({ length: 25 }, (_, index) => (
            <button
              onMouseDown={() => setIsMouseDown(true)}
              onMouseUp={() => setIsMouseDown(false)}
              onMouseEnter={() => handleMousePattern(index)}
              onClick={() => handlePattern(index)}
              key={index}
              className={`w-10 h-10 border-2 border-gray-600 rounded-md items-center justify-center flex text-gray-600 text-xl 
                ${
                  pattern.array.includes(index) || index === 12
                    ? "bg-gray-600"
                    : "bg-gray-50"
                }`}
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
