import { useContext } from "react";
import Header from "../../components/Header";
import { Outlet } from "react-router-dom";
import GameContext from "../../context/GameContext";
import WinningPatternModal from "../../components/modal/WinningPatternModal";

function Game() {
  const { isOpenModal } = useContext(GameContext);
  return (
    <>
      <div className="relative flex flex-col w-screen min-h-screen">
        <Header />
        <Outlet />
        {isOpenModal && <WinningPatternModal />}
      </div>
    </>
  );
}

export default Game;
