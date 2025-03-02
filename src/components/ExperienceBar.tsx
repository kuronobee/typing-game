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

  return (
    <div className="flex-1">
      {/* レベル表記を上部中央に配置 */}
      <div className="text-left text-white font-bold mb-0">
        Lv. {playerLevel}
      </div>
      {/* 経験値バー */}
      <div className="w-[90%] h-3 bg-gray-700 rounded-full relative">
        <div
          className="h-full bg-yellow-500 rounded-full transition-all"
          style={{ width: `${expProgress}%` }}
        ></div>
        {/* 経験値／閾値のテキストをゲージ内の右寄せで表示 */}
        <span className="absolute right-2 top-0 bottom-0 flex items-center text-xs text-white font-bold">
          {playerEXP} / {expToNextLevel}
        </span>
        {expGain !== null && (
          <div className="absolute inset-0 top-0 bottom-0 flex justify-center items-centor text-blue-500 font-bold text-sm animate-pulse">
            +{expGain} EXP
          </div>
        )}
      </div>
    </div>

  );
};

export default ExperienceBar;
