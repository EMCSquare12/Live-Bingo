// src/App.jsx
import { createBrowserRouter, RouterProvider } from "react-router-dom";
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
import Theme from "./pages/Theme/Theme";
import "./background.css"; 

const NavigationHandler = () => {
  const { setIsHostLeftModalVisible } = useContext(GameContext);

  useEffect(() => {
    const handleHostLeft = () => {
      console.log("[Client] The host has left the game. Showing modal.");
      setIsHostLeftModalVisible(true);
    };

    socket.on("host-left", handleHostLeft);

    return () => {
      socket.off("host-left", handleHostLeft);
    };
  }, [setIsHostLeftModalVisible]);

  return null;
};

function AppContent() {
  const { theme } = useContext(GameContext);
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
    {
      path: "/theme",
      element: <Theme />,
    },
  ]);
  return (
    <>
      <div
        className="background-container"
        style={{
          backgroundColor: theme.backgroundColor,
          backgroundImage: `url(${theme.backgroundImage})`,
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;