function Logo() {
  const charStyle = {
    char: ["B", "I", "N", "G", "O"],
    styles: [
      "text-blue-500",
      "text-red-500",
      "text-gray-300",
      "text-green-500",
      "text-yellow-500",
    ],
  };
  return (
    <div className="flex items-center justify-center h-auto gap-2 py-2 cursor-pointer w-fit">
      <div className="flex gap-2 px-2 border-2 border-white rounded-md">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-lg font-bold md:text-xl ${charStyle.styles[index]}`}
          >
            {charStyle.char[index]}
          </div>
        ))}
      </div>
      <div className="text-lg font-medium text-white inter md:text-xl">
        Live
      </div>
    </div>
  );
}
export default Logo;
