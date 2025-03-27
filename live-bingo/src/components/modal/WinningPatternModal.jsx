import { useContext, useRef, useEffect, useState } from "react";
import ModalContext from "../../context/ModalContext";

const WinningPatternModal = () => {
  const {
    setIsOpenModal,
    setPatternName,
    patternName,
    setPatternArray,
    patternArray,
  } = useContext(ModalContext);
  const patternRef = useRef(null);
  const mouseRef = useRef(null);
  const [isMouseEnter, setIsMouseEnter] = useState(false);

  const handlePattern = (index) => {
    if (patternArray.includes(index)) {
      const filteredIndex = patternArray.filter((item) => item !== index);
      setPatternArray(filteredIndex);
    } else {
      setPatternArray((prev) => [...prev, index]);
    }
  };

  const handleMousePattern = (index) => {
    setIsMouseEnter(true);
    handlePattern(index);
  };

  const handleClickOutside = (event) => {
    if (patternRef.current && !patternRef.current.contains(event.target)) {
      setIsOpenModal(false);
      setPatternName("Customize");
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed top-0 left-0 z-10 flex items-center justify-center w-screen h-screen bg-opacity-25 bg-gray-50">
      <div
        ref={patternRef}
        className="flex flex-col gap-4 p-6 rounded-lg shadow-lg bg-gray-50"
      >
        <div className="flex flex-col gap-1 rounded-md">
          <label
            htmlFor="patternName"
            className="flex items-center text-gray-600 text-md font-inter"
          >
            Pattern Name:
          </label>
          <input
            value={patternName}
            onChange={(e) => setPatternName(e.target.value)}
            id="patternName"
            type="text"
            className="w-full h-10 px-2 py-1 text-gray-600 bg-gray-200 rounded-md outline-gray-600 text-md font-inter"
          />
        </div>
        <div className="grid grid-cols-5 grid-rows-5 gap-2 p-4 bg-gray-200 rounded-md w-fit">
          {Array.from({ length: 25 }, (_, index) => (
            <button
              ref={mouseRef}
              onMouseEnter={() => handleMousePattern(index)}
              onClick={() => handlePattern(index)}
              key={index}
              className={`w-10 h-10 border-2 border-gray-600 rounded-md ${
                patternArray.includes(index) ? "bg-gray-600" : "bg-gray-50"
              }`}
            ></button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="flex items-center justify-center p-1 px-3 font-medium bg-blue-600 rounded-md hover:bg-blue-700 text-gray-50 font-inter text-md">
            Confirm
          </button>
          <button
            onClick={() => {
              setIsOpenModal(false), setPatternName("Customize");
            }}
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
