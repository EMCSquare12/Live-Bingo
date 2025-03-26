import { useContext, useRef, useEffect } from "react";
import ModalContext from "../../context/ModalContext";

const WinningPatternModal = () => {
  const { setIsOpenModal } = useContext(ModalContext);
  const patternRef = useRef(null);

  const handleClickOutside = (event) => {
    if (patternRef.current && !patternRef.current.contains(event.target)) {
      setIsOpenModal(false);
    }
  };
  useEffect(() => {
    const handleClick = () => setIsOpenModal(false);
    document.addEventListener("mousedown", handleClickOutside);

    if (patternRef.current) {
      patternRef.current.addEventListener("click", handleClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (patternRef.current) {
        patternRef.current.removeEventListener("click", handleClick);
      }
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
            id="patternName"
            type="text"
            className="w-full h-10 px-2 py-1 text-gray-600 bg-gray-200 rounded-md outline-gray-600 text-md font-inter"
          />
        </div>
        <div className="grid grid-cols-5 grid-rows-5 gap-2 p-4 bg-gray-200 rounded-md w-fit">
          {Array.from({ length: 25 }, (_, index) => (
            <button
              key={index}
              className="w-10 h-10 border-2 border-gray-600 rounded-md"
            ></button>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <button className="flex items-center justify-center p-1 px-3 font-medium bg-blue-600 rounded-md hover:bg-blue-700 text-gray-50 font-inter text-md">
            Confirm
          </button>
          <button
            onClick={() => setIsOpenModal(false)}
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
