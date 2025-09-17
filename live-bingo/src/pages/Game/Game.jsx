import { useContext } from "react";
import { Outlet, useParams } from "react-router-dom";
import Confetti from "react-confetti";
import GameContext from "../../context/GameContext.js";
import Header from "../../components/Header";
import WinningPatternModal from "../../components/modal/WinningPatternModal";
import WinnerModal from "../../components/modal/WinnerModal";
import NoRoom from "./NoRoom";
import NewGameModal from "../../components/modal/NewGameModal";
import HostLeftModal from "../../components/modal/HostLeftModal.jsx";
import ConfirmationModal from "../../components/modal/ConfirmationModal.jsx";

function Game() {
  const {
    isOpenModal,
    isLoading,
    isReconnecting,
    host,
    player,
    winMessage,
    isNewGameModalVisible,
    isHostLeftModalVisible,
    confirmation,
    roomCode: contextRoomCode,
    showConfetti, // Get the confetti state
  } = useContext(GameContext);
  const { roomCode: urlRoomCode, playerId: urlPlayerId } = useParams();

  if (isLoading || isReconnecting) {
    return (
      <div className="flex items-center justify-center w-screen h-screen text-white bg-gray-900">
        Loading Game...
      </div>
    );
  }

  const isAuthorizedHost =
    host.isHost &&
    !urlPlayerId &&
    contextRoomCode?.toLowerCase() === urlRoomCode?.toLowerCase();
  const isAuthorizedPlayer =
    player.id &&
    player.id === urlPlayerId &&
    contextRoomCode?.toLowerCase() === urlRoomCode?.toLowerCase();
  const isAuthorized = isAuthorizedHost || isAuthorizedPlayer;

  if (!isAuthorized) {
    return <NoRoom />;
  }

  return (
    <div className="relative flex flex-col w-screen h-screen">
      {showConfetti && <Confetti />}
      <Header />
      <Outlet />
      {isOpenModal && <WinningPatternModal />}
      {winMessage && <WinnerModal />}
      {isNewGameModalVisible && <NewGameModal />}
      {isHostLeftModalVisible && <HostLeftModal />}
      {confirmation.isOpen && (
        <ConfirmationModal
          message={confirmation.message}
          onConfirm={confirmation.onConfirm}
          onCancel={confirmation.onCancel}
        />
      )}
    </div>
  );
}

export default Game;
