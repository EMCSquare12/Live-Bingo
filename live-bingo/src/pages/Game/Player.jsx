import { useContext, useState } from "react";
import BingoCard from "../../components/BingoCard";
import GameContext from "../../context/GameContext";

function Player() {
  const { player } = useContext(GameContext);
  const [isRefreshed, setIsRefreshed] = useState(false);
  console.log(player);

  return (
    <>
      <div className="flex flex-row items-center justify-center w-full h-full min-h-screen bg-gray-900">
        {player.cards?.map((value, index) => (
          <BingoCard
            key={index}
            letterNumber={value}
            handleRefresh={() => setIsRefreshed(!isRefreshed)}
          />
        ))}
      </div>
    </>
  );
}

export default Player;
