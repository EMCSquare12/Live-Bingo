// src/components/BingoCard.jsx
import { GiRoundStar } from "react-icons/gi";
import { FiRefreshCw } from "react-icons/fi";
import { useContext, useRef, useEffect } from "react";
import GameContext from "../context/GameContext";

function BingoCard({ letterNumber, handleRefresh, markedNumbers, handleNumberClick, onLetterClick, activeColorPicker, onColumnColorChange, isThemeEditor = false }) {
  const { host, theme } = useContext(GameContext);
  const isGameStarted = host.numberCalled && host.numberCalled.length > 1;
  const colorPickerRef = useRef(null);
  const columns = ["B", "I", "N", "G", "O"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (onLetterClick && colorPickerRef.current && !colorPickerRef.current.contains(event.target)) {
        onLetterClick(null);
      }
    };
    if (isThemeEditor) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      if(isThemeEditor) {
        document.removeEventListener("mousedown", handleClickOutside);
      }
    };
  }, [onLetterClick, isThemeEditor]);

  return (
    <div
      className={`relative flex flex-col gap-4 p-4 overflow-hidden rounded-lg shadow-lg w-fit h-fit ${theme.isTransparent ? 'glass-morphism' : ''}`}
      style={{ 
        backgroundColor: theme.color
      }}
    >
      <div className="absolute top-0 right-0 flex flex-row overflow-hidden bg-white rounded-bl-lg h-fit w-fit bg-opacity-20">
        <button
          onClick={handleRefresh}
          disabled={isGameStarted}
          className={`flex items-center justify-center h-6 p-1 px-2 text-md text-gray-50 ${
            isGameStarted
              ? "cursor-not-allowed text-gray-400"
              : "hover:bg-gray-400"
          }`}
        >
          <FiRefreshCw />
        </button>
        <button className="flex items-center justify-center h-6 p-1 px-2 font-medium text-md text-gray-50 hover:bg-gray-400">
          DIY
        </button>
      </div>
      <div className="grid grid-cols-5 grid-rows-1 gap-2 py-2 mt-4 rounded-md h-fit">
        {columns.map((label) => (
          <div
            key={label}
            className={`relative flex items-center justify-center w-12 text-4xl font-bold ${isThemeEditor ? 'cursor-pointer' : ''}`}
            style={{ color: theme.columnColors[label] }}
            onClick={() => isThemeEditor && onLetterClick(label)}
          >
            {label}
            {isThemeEditor && activeColorPicker === label && (
              <div ref={colorPickerRef} className="absolute top-full mt-2 z-10" onClick={(e) => e.stopPropagation()}>
                <input
                  type="color"
                  value={theme.columnColors[label]}
                  onChange={(e) => onColumnColorChange(label, e.target.value)}
                  className="w-16 h-10 p-1 bg-transparent border-0 rounded-md cursor-pointer"
                />
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-5 grid-rows-1 gap-2 rounded-md">
        {Object.keys(letterNumber).map((char, colIndex) => (
          <div
            key={colIndex}
            className="grid grid-cols-1 grid-rows-5 gap-2 rounded-md"
          >
            {letterNumber[char].map((num, rowIndex) => {
              const isCalled = host.numberCalled?.includes(num);
              const isMarked = markedNumbers.includes(num);
              return (
                <div
                  key={rowIndex}
                  onClick={() => handleNumberClick(num)}
                  className={`flex items-center justify-center w-12 h-12 text-xl font-bold rounded-md font-inter ${
                    isCalled ? "cursor-pointer" : ""
                  }`}
                  style={{
                    backgroundColor: isCalled && isMarked ? '#6b7280' : theme.cardGridColor,
                    color: theme.columnColors[char],
                  }}
                >
                  {rowIndex === 2 && colIndex === 2 ? <GiRoundStar style={{color: theme.columnColors.N}} /> : num}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
export default BingoCard;