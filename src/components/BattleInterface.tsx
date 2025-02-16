// src/components/BattleInterface.tsx
import React, { useState } from "react";
import { Question } from "../data/questions";
import ExperienceBar from "./ExperienceBar";
import PlayerStatus from "./PlayerStatus";

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
  expGain?: number | null;
  inputRef: React.RefObject<HTMLInputElement>;
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
  inputRef,
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

  return (
    <div className="absolute top-1/2 left-0 w-full p-4 bg-gray-900 text-white border-t border-gray-700">
      <div className="flex">
        <input
          type="text"
          className="w-full p-2 text-lg bg-amber-200 text-black rounded"
          value={userInput}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="正しい解答を入力..."
          ref={inputRef}
        />
      </div>
      <PlayerStatus
        playerHP={playerHP}
        maxHP={maxHP}
        playerMP={playerMP}
        maxMP={maxMP}
      />
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
