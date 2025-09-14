import {
  createBrowserRouter,
  RouterProvider,
  useNavigate,
} from "react-router-dom";
import Lobby from "./pages/Lobby/Lobby";
import Game from "./pages/Game/Game";
import JoinRoom from "./pages/Lobby/JoinRoom";
import HostRoom from "./pages/Lobby/HostRoom";
import PlayerGuard from "./pages/Game/PlayerGuard";
import HostGuard from "./pages/Game/HostGuard";
import GameProvider from "./context/GameProvider";
import NoRoom from "./pages/Game/NoRoom";
import { useContext, useEffect } from "react";
import GameContext from "./context/GameContext";
import { socket } from "./utils/socket";

// This component lives inside the router and handles navigation events
const NavigationHandler = () => {
  const navigate = useNavigate();
  const { resetGame, host } = useContext(GameContext);

  useEffect(() => {
    // Only players need to listen for this event
    if (!host.isHost) {
      const handleHostLeft = () => {
        console.log("[Client] Received 'host-left' event!");
        alert("The host has ended the game. Returning to the lobby.");
        resetGame();
        navigate("/");
      };
      
      console.log("[Client] Player is setting up 'host-left' listener.");
      socket.on("host-left", handleHostLeft);

      return () => {
        console.log("[Client] Player is cleaning up 'host-left' listener.");
        socket.off("host-left", handleHostLeft);
      };
    }
  }, [navigate, resetGame, host.isHost]);

  return null; // This component renders nothing
};

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Lobby />,
      children: [
        { index: true, element: <JoinRoom /> },
        { path: "host", element: <HostRoom /> },
      ],
    },
    {
      path: "/:roomCode",
      element: (
        <>
          <NavigationHandler />
          <Game />
        </>
      ),
      children: [
        { index: true, element: <HostGuard /> },
        { path: ":playerId", element: <PlayerGuard /> },
      ],
    },
    {
      path: "/no-room",
      element: <NoRoom />,
    },
  ]);
  return (
    <GameProvider>
      <RouterProvider router={router} />
    </GameProvider>
  );
}

export default App;