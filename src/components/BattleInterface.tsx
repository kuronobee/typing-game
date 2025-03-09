// src/components/BattleInterface.tsx - 入力フィールドの処理を改善
import React, { useState, useEffect } from "react";
import { Player } from "../models/Player";
import PlayerInfo from "./PlayerInfo";

interface BattleInterfaceProps {
  player: Player;
  onSubmit: (input: string) => void;
  expGain?: number | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  isKeyboardVisible?: boolean;
}

const BattleInterface: React.FC<BattleInterfaceProps> = ({
  player,
  onSubmit,
  expGain,
  inputRef,
  isKeyboardVisible = false,
}) => {
  const [userInput, setUserInput] = useState("");
  const [shouldSelectInput, setShouldSelectInput] = useState(false);

  useEffect(() => {
    if (shouldSelectInput && inputRef.current) {
      inputRef.current.select();
      setShouldSelectInput(false);
    }
  }, [shouldSelectInput, inputRef]);

  // コンポーネントがマウントされたら、入力フィールドにフォーカスする
  useEffect(() => {
    if (inputRef.current) {
      // 初期表示時にフォーカスする
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserInput(e.target.value);
  };

  // 入力の送信処理（共通関数）
  const processSubmit = () => {
    // 入力をトリムして空白チェック
    const trimmedInput = userInput.trim();
    
    // 空の場合は送信しない
    if (!trimmedInput) return;
    
    // トリムした値を送信
    onSubmit(trimmedInput);
    
    // 入力をクリア
    setUserInput("");
    
    // 入力フィールドにフォーカスを維持
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processSubmit();
    }
  };

  const handleSubmitButton = (e: React.MouseEvent) => {
    e.preventDefault();
    processSubmit();
  };

  return (
    <div 
      className={`
        w-full flex flex-col
        ${isKeyboardVisible 
          ? 'justify-start mt-6' // キーボード表示時に上部に余白を追加
          : 'justify-centor p-2'} 
        bg-gray-900 text-white border-t border-gray-700 
        transition-all duration-300
      `}
    >
      {/* 入力フィールドのラッパー */}
      <div className="input-wrapper px-2 mb-2">
        <div className="flex">
          <input
            type="text"
            autoFocus
            className="flex-1 p-2 text-lg bg-amber-200 text-black rounded-l"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="正しい解答を入力..."
            ref={inputRef}
            style={{ fontSize: '16px' }}
            inputMode="text"
            autoCorrect="off"
            autoCapitalize="none"
            spellCheck="false"
            // onBlurを無効化して、フォーカスが失われないようにする
            onBlur={() => {
              // スマホでの操作時にフォーカスを失わないようにする
              // タイマーを使用して非同期で再フォーカス
              setTimeout(() => {
                if (inputRef.current) {
                  inputRef.current.focus();
                }
              }, 10);
            }}
          />
          <button
            className="px-4 bg-blue-600 text-white rounded-r"
            onClick={handleSubmitButton}
            type="button"
          >
            送信
          </button>
        </div>
      </div>
      
      {/* PlayerInfo */}
      <div className={`transition-all duration-300 transform origin-top`}>
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
          isCompact={isKeyboardVisible}
        />
      </div>
    </div>
  );
};

export default BattleInterface;