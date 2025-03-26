import LobbyContext from "./LobbyContext";

const LobbyProvider = ({ children }) => {
  const value = {
    name: "",
    roomCode: "",
  };
  return (
    <>
      <LobbyContext.Provider value={value}>{children}</LobbyContext.Provider>
    </>
  );
};

export default LobbyProvider;
