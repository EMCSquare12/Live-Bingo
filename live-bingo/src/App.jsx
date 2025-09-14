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
  const { host, isHostLeftModalVisible, setIsHostLeftModalVisible } =
    useContext(GameContext);

  useEffect(() => {
    const handleHostLeft = () => {
      if (!host.isHost) {
        console.log("[Client] The host has left the game. Showing modal.");
        setIsHostLeftModalVisible(true);
      }
    };

    socket.on("host-left", handleHostLeft);

    return () => {
      socket.off("host-left", handleHostLeft);
    };
  }, [host.isHost, setIsHostLeftModalVisible]);

  return null;
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
