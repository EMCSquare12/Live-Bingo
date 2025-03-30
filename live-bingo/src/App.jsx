import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Lobby from "./pages/Lobby/Lobby";
import Game from "./pages/Game/Game";
import JoinRoom from "./pages/Lobby/JoinRoom";
import HostRoom from "./pages/Lobby/HostRoom";
import Player from "./pages/Game/Player";
import Host from "./pages/Game/Host";
import GameProvider from "./context/GameProvider";
import { useContext } from "react";
import GameContext from "./context/GameContext";

function App() {
  const { roomCode } = useContext(GameContext);
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
      path: `/${roomCode || ":roomCode"}`, // Handle undefined roomCode
      element: <Game />,
      children: [
        { index: true, element: <Host /> },
        { path: "player", element: <Player /> },
      ],
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
