import { useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import GameContext from "../../context/GameContext.js"; // Corrected file extension
import Header from "../../components/Header";
import WinningPatternModal from "../../components/modal/WinningPatternModal";
import WinnerModal from "../../components/modal/WinnerModal";
import NoRoom from "./NoRoom";

function Game() {
  const {
    isOpenModal,
    isLoading,
    host,
    player,
    roomCode: contextRoomCode,
  } = useContext(GameContext);
  const { roomCode: urlRoomCode, playerId: urlPlayerId } = useParams();

  // Show a loading screen while the provider is trying to reconnect the session.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen text-white bg-gray-900">
        Loading Game...
      </div>
    );
  }

  // Determine if the current user is authorized to be on this page.
  const isAuthorizedHost =
    host.isHost &&
    !urlPlayerId &&
    contextRoomCode?.toLowerCase() === urlRoomCode?.toLowerCase();
  const isAuthorizedPlayer =
    player.id &&
    player.id === urlPlayerId &&
    contextRoomCode?.toLowerCase() === urlRoomCode?.toLowerCase();
  const isAuthorized = isAuthorizedHost || isAuthorizedPlayer;

  // If the user is NOT authorized, render the full-screen NoRoom component.
  if (!isAuthorized) {
    return <NoRoom />;
  }

  // If they ARE authorized, render the game layout with the header.
  return (
    <div className="relative flex flex-col w-screen min-h-screen">
      <Header />
      <Outlet />
      {isOpenModal && <WinningPatternModal />}
      {latestWinner && <WinnerModal />}{" "}
      {/* Show modal if there is a new winner */}
    </div>
  );
}

export default Game;
