function Logo() {
  return (
    <div className="flex items-center justify-center h-auto gap-2 py-2 cursor-pointer w-fit">
      <div className="flex gap-2 px-2 border-2 border-white rounded-md">
        <div className="flex items-center justify-center text-lg font-bold text-blue-500 md:text-xl">
          B
        </div>
        <div className="flex items-center justify-center text-lg font-bold text-red-500 md:text-xl">
          I
        </div>
        <div className="flex items-center justify-center text-lg font-bold text-gray-300 md:text-xl">
          N
        </div>
        <div className="flex items-center justify-center text-lg font-bold text-green-500 md:text-xl">
          G
        </div>
        <div className="flex items-center justify-center text-lg font-bold text-yellow-500 md:text-xl">
          O
        </div>
      </div>
      <div className="text-lg font-medium text-white inter md:text-xl">
        Live
      </div>
    </div>
  );
}
export default Logo;
