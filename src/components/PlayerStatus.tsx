// src/components/PlayerStatus.tsx
import React from "react";

interface PlayerStatusProps {
  playerHP: number;
  maxHP: number;
  playerMP: number;
  maxMP: number;
  isPoisoned?: boolean;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  playerHP,
  maxHP,
  playerMP,
  maxMP,
  isPoisoned = false,
}) => {
  const hpPercentage = (playerHP / maxHP) * 100;
  const mpPercentage = (playerMP / maxMP) * 100;

  return (
    <div className="flex-1">
      {/* HPゲージ */}
      <div className="mt-0 flex items-center">
        <div className="w-10 text-left">
          <span className="text-sm font-bold text-white mr-2">HP</span>
        </div>
        <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${isPoisoned ? "bg-purple-500" : "bg-green-500"
              }`}
            style={{ width: `${hpPercentage}%` }}
          ></div>
          <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs text-white font-bold">
            {playerHP} / {maxHP}
          </span>
        </div>
      </div>
      {/* MPゲージ */}
      <div className="-mt-1.5 flex items-center">
        <div className="w-10 text-left">
          <span className="text-sm font-bold text-white mr-2">MP</span>
        </div>
        <div className="relative w-full h-4 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${mpPercentage}%` }}
          ></div>
          <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs text-white font-bold">
            {playerMP} / {maxMP}
          </span>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PlayerStatus);
