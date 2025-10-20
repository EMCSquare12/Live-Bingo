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
      // Adjusted padding and gap for smaller screens
      className={`relative flex flex-col gap-2 p-3 md:gap-4 md:p-4 overflow-hidden rounded-lg shadow-lg w-fit h-fit ${theme.isTransparent ? 'glass-morphism' : ''}`}
      style={{ 
        backgroundColor: theme.color
      }}
    >
      <div className="absolute top-0 right-0 z-10 flex flex-row overflow-hidden bg-white rounded-bl-lg h-fit w-fit bg-opacity-20"> {/* Added z-index */}
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
      {/* Adjusted BINGO letters size and spacing */}
      <div className="grid grid-cols-5 grid-rows-1 gap-1 py-1 mt-4 md:gap-2 md:py-2 rounded-md h-fit">
        {columns.map((label) => (
          <div
            key={label}
            className={`relative flex items-center justify-center w-8 h-8 md:w-12 text-2xl md:text-4xl font-bold ${isThemeEditor ? 'cursor-pointer' : ''}`} // Adjusted size and font
            style={{ color: theme.columnColors[label] }}
            onClick={() => isThemeEditor && onLetterClick(label)}
          >
            {label}
            {isThemeEditor && activeColorPicker === label && (
              <div ref={colorPickerRef} className="absolute z-10 mt-2 top-full" onClick={(e) => e.stopPropagation()}>
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
      {/* Adjusted number grid size and spacing */}
      <div className="grid grid-cols-5 grid-rows-1 gap-1 md:gap-2 rounded-md">
        {Object.keys(letterNumber).map((char, colIndex) => (
          <div
            key={colIndex}
            className="grid grid-cols-1 grid-rows-5 gap-1 md:gap-2 rounded-md" // Adjusted gap
          >
            {letterNumber[char].map((num, rowIndex) => {
              const isCalled = host.numberCalled?.includes(num);
              const isMarked = markedNumbers.includes(num);
              return (
                <div
                  key={rowIndex}
                  onClick={() => handleNumberClick(num)}
                  className={`flex items-center justify-center w-8 h-8 md:w-12 md:h-12 text-lg md:text-xl font-bold rounded-md font-inter ${ // Adjusted size and font
                    isCalled ? "cursor-pointer" : ""
                  } `}
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
