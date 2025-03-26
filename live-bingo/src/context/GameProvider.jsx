import GameContext from "./GameContext";

const GameProvider = ({ children }) => {
  const value = {
    name: "",
    roomCode: "",
  };
  return (
    <>
      <GameContext.Provider value={value}>{children}</GameContext.Provider>
    </>
  );
};

export default GameProvider;
