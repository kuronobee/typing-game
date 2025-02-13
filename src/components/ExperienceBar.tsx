// src/components/ExperienceBar.tsx
import React from "react";

interface ExperienceBarProps {
  playerLevel: number;
  playerEXP: number;
  expToNextLevel: number;
  expGain?: number | null;
}

const ExperienceBar: React.FC<ExperienceBarProps> = ({
  playerLevel,
  playerEXP,
  expToNextLevel,
  expGain,
}) => {
  const expProgress = (playerEXP / expToNextLevel) * 100;
  const expRemaining = expToNextLevel - playerEXP;

  return (
    <div className="mb-2">
      <div className="flex items-center mb-1">
        <span className="text-white font-bold mr-2">Lv. {playerLevel}</span>
        <div className="w-full h-4 bg-gray-700 rounded-full relative">
          <div
            className="h-full bg-yellow-500 rounded-full transition-all"
            style={{ width: `${expProgress}%` }}
          ></div>
          {expGain !== null && (
            <div className="absolute inset-0 flex justify-center items-center text-white font-bold text-sm animate-pulse">
              +{expGain} EXP
            </div>
          )}
        </div>
      </div>
      <p className="text-center text-white text-sm">
        次のレベルまで {expRemaining} EXP
      </p>
    </div>
  );
};

export default ExperienceBar;
