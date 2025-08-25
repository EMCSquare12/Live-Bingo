import { useContext, useState } from "react";
import BingoCard from "../../components/BingoCard";
import GameContext from "../../context/GameContext";

function Player() {
  const { player } = useContext(GameContext);
  const [isRefreshed, setIsRefreshed] = useState(false);

  const cards = player.cards ?? [];

  return (
    <div className="flex items-center justify-center w-full h-full min-h-screen bg-gray-900">
      <div
        className={
          cards.length < 3
            ? "flex justify-center gap-6"
            : "grid grid-cols-3 gap-6 mt-20"
        }
      >
        {cards.map((value, index) => (
          <BingoCard
            key={index}
            letterNumber={value}
            handleRefresh={() => setIsRefreshed(!isRefreshed)}
          />
        ))}
      </div>
    </div>
  );
}

export default Player;
