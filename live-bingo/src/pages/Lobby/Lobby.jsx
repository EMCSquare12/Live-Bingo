import Logo from "../../components/Logo";
import { Outlet } from "react-router-dom";
import WinningPatternModal from "../../components/modal/WinningPatternModal";
import { useContext } from "react";
import GameContext from "../../context/GameContext";

function Lobby() {
  const { isOpenModal, theme } = useContext(GameContext);
  return (
    <>
      <div className={`grid w-full min-h-screen h-full grid-cols-1 md:grid-cols-[40%_60%] relative ${theme.isTransparent ? '' : 'bg-gray-50'}`}>
        <div className={`relative justify-between hidden w-full h-full md:flex ${theme.isTransparent ? '' : 'bg-gray-800'}`}>
          <div className={`absolute top-0 left-0 flex justify-between w-full px-2 py-2 h-fit md:px-8 ${theme.isTransparent ? '' : 'bg-gray-800'}`}>
            <Logo />
          </div>
          <section className="right-0 flex flex-col h-auto p-4 px-12 mt-40 mb-20 w-fit"></section>
        </div>
        <Outlet />
        {isOpenModal && <WinningPatternModal />}
      </div>
    </>
  );
}

export default Lobby;