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
    <div className="flex items-center justify-center h-auto gap-1 py-1 md:gap-2 md:py-2 w-fit"> {/* Adjusted gap and padding */}
      <div className="flex gap-2 px-2 border-2 border-white rounded-md">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-lg md:text-2xl font-bold ${charStyle.styles[index]}`} // Adjusted font size
          >
            {charStyle.char[index]}
          </div>
        ))}
      </div>
      <div className="text-lg font-bold tracking-wide text-white font-inter md:text-2xl"> {/* Adjusted font size */}
        Live
      </div>
    </div>
  );
}
export default Logo;
