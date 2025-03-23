import { useEffect, useState } from "react";
import BingoCard from "../../components/BingoCard";

function Player() {
  const [letterNumber, setLetterNumber] = useState({});

  const generateUniqueNumbers = (min, max, count) => {
    const uniqueNumbers = new Set();

    while (uniqueNumbers.size < count) {
      uniqueNumbers.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }

    return Array.from(uniqueNumbers);
  };

  useEffect(() => {
    const newLN = {
      B: generateUniqueNumbers(1, 15, 5), // Unique numbers for 'B'
      I: generateUniqueNumbers(16, 30, 5), // Unique numbers for 'I'
      N: generateUniqueNumbers(31, 45, 5), // Unique numbers for 'N'
      G: generateUniqueNumbers(46, 60, 5), // Unique numbers for 'G'
      O: generateUniqueNumbers(61, 75, 5), // Unique numbers for 'O'
    };

    setLetterNumber(newLN);
  }, []);

  console.log(letterNumber);

  return (
    <>
      <div className="flex flex-row items-center justify-center w-full h-full bg-gray-900">
        <BingoCard letterNumber={letterNumber} />
      </div>
    </>
  );
}

export default Player;
