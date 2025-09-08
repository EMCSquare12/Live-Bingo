import { useContext } from "react";
import Header from "../../components/Header";
import { Outlet } from "react-router-dom";
import GameContext from "../../context/GameContext";
import WinningPatternModal from "../../components/modal/WinningPatternModal";
import WinnerModal from "../../components/modal/WinnerModal";

function Game() {
  const { isOpenModal, winner } = useContext(GameContext);
  return (
    <>
      <div className="relative flex flex-col w-screen min-h-screen">
        <Header />
        <Outlet />
        {isOpenModal && <WinningPatternModal />}
        {winner && <WinnerModal />}
      </div>
    </>
  );
}

export default Game;
