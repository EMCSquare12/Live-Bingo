import Logo from "../../components/Logo";
import { Outlet } from "react-router-dom";

function Lobby() {
  return (
    <>
      <div className="grid w-full min-h-screen h-full grid-cols-[40%_60%] bg-gray-50 relative">
        <div className="relative flex justify-between w-full h-full bg-gray-800">
          <div className="absolute top-0 left-0 flex justify-between w-full px-2 py-2 bg-gray-800 h-fit md:px-8">
            <Logo />
          </div>
          {/* <section className="right-0 flex flex-col h-auto p-4 px-12 mt-40 mb-20 w-fit"></section> */}
        </div>
        <Outlet />
      </div>
    </>
  );
}

export default Lobby;
