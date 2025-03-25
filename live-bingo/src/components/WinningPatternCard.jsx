import { GiRoundStar } from "react-icons/gi";

function WinningPatternCard() {
  return (
    <div className="grid grid-cols-5 grid-rows-5 gap-1 p-1 rounded-md">
      {Array.from({ length: 25 }, (_, index) => (
        <div className="flex items-center justify-center w-8 h-8 text-gray-100 bg-gray-600 border border-gray-600 rounded-md ">
          {index === 12 ? <GiRoundStar /> : ""}
        </div>
      ))}
    </div>
  );
}
export default WinningPatternCard;
