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
// This component lives inside the router and handles navigation events
const NavigationHandler = () => {
  const navigate = useNavigate();
  const { resetGame, host } = useContext(GameContext);

  useEffect(() => {
    // This event handler will be called when the server broadcasts "host-left"
    const handleHostLeft = () => {
      // We double-check that this client is a player before taking action.
      if (!host.isHost) {
        console.log(
          "[Client] The host has left the game. Navigating to lobby."
        );
        alert("The host has ended the game. Returning to the lobby.");
        resetGame(); // Clear all game-related state
        navigate("/"); // Redirect to the homepage/lobby
      }
    };

    // Listen for the 'host-left' event from the server
    socket.on("host-left", handleHostLeft);

    // Cleanup: remove the event listener when the component unmounts
    return () => {
      socket.off("host-left", handleHostLeft);
    };
  }, [navigate, resetGame, host.isHost]); // Dependencies for the effect

  return null; // This component does not render anything
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
