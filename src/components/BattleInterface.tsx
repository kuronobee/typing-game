import React, { useState } from "react";
import { Question } from "../data/questions";
import ExperienceBar from "./ExperienceBar";

interface BattleInterfaceProps {
  playerHP: number;
  maxHP: number;
  playerMP: number;
  maxMP: number;
  playerLevel: number;
  playerEXP: number;
  expToNextLevel: number;
  totalEXP: number;
  onSubmit: (input: string) => void;
  currentQuestion: Question | null;
  // 経験値バー用のプロパティ
  expGain?: number | null;
}

const BattleInterface: React.FC<BattleInterfaceProps> = ({
  playerHP,
  maxHP,
  playerMP,
  maxMP,
  playerLevel,
  playerEXP,
  expToNextLevel,
  totalEXP,
  onSubmit,
  currentQuestion,
  expGain,
}) => {
  const [userInput, setUserInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit(userInput);
      setUserInput("");
    }
  };
  // 経験値バーの進捗（%）
  const expProgress = (playerEXP / expToNextLevel) * 100;
  const expRemaining = expToNextLevel - playerEXP;

  return (
    <div className="absolute top-1/2 left-0 w-full p-4 bg-gray-900 text-white border-t border-gray-700">
      {/* 入力フィールド */}
      <div className="flex">
        <input
          type="text"
          className="w-full p-2 text-lg bg-amber-200 text-black rounded"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="正しい解答を入力..."
        />
      </div>
      {/* プレイヤー情報 */}
      <div className="mb-2 flex justify-between items-center">
        <div className="w-1/2">
          <p className="text-sm">
            HP: {playerHP} / {maxHP}
          </p>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${(playerHP / maxHP) * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="w-1/2">
          <p className="text-sm">
            MP: {playerMP} / {maxMP}
          </p>
          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${(playerMP / maxMP) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
      {/* 経験値バーと次のレベルまでの表示 */}
      <ExperienceBar
        playerLevel={playerLevel}
        playerEXP={playerEXP}
        expToNextLevel={expToNextLevel}
        expGain={expGain}
        />
    </div>
  );
};

export default BattleInterface;
