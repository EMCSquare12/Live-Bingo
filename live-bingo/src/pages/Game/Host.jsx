import { useState } from "react";

function Host() {
  const charStyle = {
    char: ["B", "I", "N", "G", "O"],
    styles: [
      "bg-blue-500",
      "bg-red-500",
      "bg-gray-300",
      "bg-green-500",
      "bg-yellow-500",
    ],
  };
  const [numbers, setNumbers] = useState([...Array(75)].map((_, i) => i + 1));
  const [generatedNumber, setGeneratedNumber] = useState();

  const handleShake = () => {
    if (numbers.length === 0) return;
    const randomNumber = numbers[Math.floor(Math.random() * numbers.length)];
    const removedNumber = numbers.filter((num) => num !== randomNumber);
    setNumbers(removedNumber);
    setGeneratedNumber(randomNumber);
    console.log(randomNumber);
  };
  console.log(generatedNumber, numbers);
  return (
    <>
      <div className="grid  w-full h-auto grid-cols-[1fr_1.5fr_1fr] grid-rows-1 gap-10 p-10 bg-gray-900 items-start">
        <div className="flex flex-col w-full min-h-[70%] rounded-xl bg-gray-600 mt-20 items-center justify-between p-10 shadow-lg">
          <div className="flex flex-col items-center justify-center gap-2">
            {generatedNumber && (
              <div
                className={`flex items-center justify-center text-4xl font-bold ${
                  charStyle.styles[Math.floor(generatedNumber / 15)]
                } rounded-lg text-gray-50 w-14 h-14 inter`}
              >
                {charStyle.char[Math.floor(generatedNumber / 15)]}
              </div>
            )}
            <div className="w-full font-medium text-center text-9xl inter text-gray-50">
              {generatedNumber}
            </div>
          </div>
          <button
            onClick={handleShake}
            className="flex items-center justify-center px-6 py-2 mt-6 font-medium bg-blue-600 rounded-md text-gray-50 inter hover:bg-blue-700"
          >
            Shake
          </button>
        </div>

        <div className="flex flex-col items-start justify-start w-full p-10 mt-20 bg-gray-600 shadow-lg h-fit rounded-xl">
          {Array.from({ length: 5 }, (_, charIndex) => (
            <div
              key={charIndex}
              className="flex flex-row items-start justify-center w-full gap-5 h-fit"
            >
              <div
                className={`flex items-center justify-center w-10 h-10 mt-2 text-lg font-bold ${charStyle.styles[charIndex]} rounded-md text-gray-50 inter`}
              >
                {charStyle.char[charIndex]}
              </div>
              <div className="flex flex-wrap items-center w-full h-full gap-1 p-2 rounded-lg 0">
                {Array.from({ length: 15 }, (_, numIndex) => (
                  <div
                    key={numIndex}
                    className="flex items-center justify-center text-sm font-medium text-center bg-gray-500 rounded-md w-7 h-7 text-gray-50 "
                  >
                    {numIndex + charIndex * 15 + 1}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex flex-col w-full h-[70%] rounded-xl bg-gray-600 mt-20 shadow-lg"></div>
      </div>
    </>
  );
}

export default Host;
