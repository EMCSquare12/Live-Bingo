import Player from "./Player.jsx";

const PlayerGuard = () => {
  // Authorization is now handled by the parent Game.jsx component.
  // This component's only job is to render the Player page.
  return <Player />;
};

export default PlayerGuard;