import Header from "../../components/Header";
import { Outlet } from "react-router-dom";
function Game() {
  return (
    <>
      <div className="flex flex-col w-screen min-h-screen">
        <Header />
        <Outlet />
      </div>
    </>
  );
}

export default Game;
