// src/components/PlayerStatus.tsx
import React from "react";

interface PlayerStatusProps {
  playerHP: number;
  maxHP: number;
  playerMP: number;
  maxMP: number;
}

const PlayerStatus: React.FC<PlayerStatusProps> = ({
  playerHP,
  maxHP,
  playerMP,
  maxMP,
}) => {
  const hpPercentage = (playerHP / maxHP) * 100;
  const mpPercentage = (playerMP / maxMP) * 100;

  return (
    <div className="mb-2 flex justify-between items-center">
      <div className="w-1/2">
        <p className="text-sm">HP: {playerHP} / {maxHP}</p>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 transition-all"
            style={{ width: `${hpPercentage}%` }}
          ></div>
        </div>
      </div>
      <div className="w-1/2">
        <p className="text-sm">MP: {playerMP} / {maxMP}</p>
        <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 transition-all"
            style={{ width: `${mpPercentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStatus;
