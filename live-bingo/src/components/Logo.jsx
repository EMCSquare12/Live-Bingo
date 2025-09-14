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
    <div className="flex items-center justify-center h-auto gap-2 py-2 w-fit">
      <div className="flex gap-2 px-2 border-2 border-white rounded-md">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={`flex items-center justify-center text-xl font-bold md:text-2xl ${charStyle.styles[index]}`}
          >
            {charStyle.char[index]}
          </div>
        ))}
      </div>
      <div className="text-xl font-bold tracking-wide text-white font-inter md:text-2xl">
        Live
      </div>
    </div>
  );
}
export default Logo;
