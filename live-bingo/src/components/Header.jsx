import { MdVolumeUp } from "react-icons/md";
import { MdVolumeOff } from "react-icons/md";
import Logo from "./Logo";

function Header() {
  return (
    <>
      <div className="flex justify-between w-screen px-2 py-2 bg-gray-800 h-fit md:px-8">
        <Logo />
        <div className="flex gap-1">
          <button className="flex items-center justify-center gap-1 px-3 py-2 text-sm font-medium text-gray-400 inter md:text-lg hover:rounded-md hover:text-gray-100 hover:bg-gray-700">
            <MdVolumeOff className="text-xl" />
            Turn on sound
          </button>
          <button className="px-3 py-2 text-sm font-medium text-gray-400 inter md:text-lg hover:rounded-md hover:bg-gray-700 hover:text-gray-100">
            Leave game
          </button>
        </div>
      </div>
    </>
  );
}

export default Header;
