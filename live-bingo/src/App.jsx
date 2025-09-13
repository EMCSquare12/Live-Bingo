import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./pages/Lobby/Lobby";
import Game from "./pages/Game/Game";
import JoinRoom from "./pages/Lobby/JoinRoom";
import HostRoom from "./pages/Lobby/HostRoom";
import PlayerGuard from "./pages/Game/PlayerGuard"; // Import PlayerGuard
import HostGuard from "./pages/Game/HostGuard";
import GameProvider from "./context/GameProvider";
import NoRoom from "./pages/Game/NoRoom";

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
      element: <Game />,
      children: [
        { index: true, element: <HostGuard /> },
        { path: ":playerId", element: <PlayerGuard /> }, // Use PlayerGuard here instead of Player
      ],
    },
    {
      path: "/no-room",
      element: <NoRoom />,
    },
  ]);
  return (
    <>
      <GameProvider>
        <RouterProvider router={router} />
      </GameProvider>
    </>
  );
}

export default App;