// src/components/BattleInterface.tsx
import React, { useState } from "react";
import { Player } from "../models/Player";
import PlayerInfo from "./PlayerInfo";

interface BattleInterfaceProps {
  player: Player;
  onSubmit: (input: string) => void;
  expGain?: number | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const BattleInterface: React.FC<BattleInterfaceProps> = ({
  player,
  onSubmit,
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

  // プレイヤーが毒状態かどうかをチェック
  // const isPoisoned = player.statusEffects.some((effect) => effect.type === "poison");

  return (
    <div className="absolute top-0 left-0 w-full p-2 bg-gray-900 text-white border-t border-gray-700">
      {/* 入力フィールド */}
      <div>
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
      <PlayerInfo
        playerHP={player.hp}
        maxHP={player.maxHP}
        playerMP={player.mp}
        maxMP={player.maxMP}
        isPoisoned={player.statusEffects.some(effect => effect.type === "poison")}
        playerLevel={player.level}
        playerEXP={player.exp}
        expToNextLevel={player.levelUpThreshold}
        expGain={expGain}
      />
    </div>
  );
};

export default BattleInterface;
