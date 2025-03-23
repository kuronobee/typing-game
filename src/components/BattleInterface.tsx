// src/components/BattleInterface.tsx - スキル説明パネルを削除した版
import React, { useState, useEffect } from "react";
import { Player } from "../models/Player";
import SkillBar from "./SkillBar";
import { SkillInstance } from "../models/Skill";
import { Enemy } from "../models/EnemyModel";

interface BattleInterfaceProps {
  player: Player;
  onSubmit: (input: string) => void;
  onSkillUse: (skill: SkillInstance, targetIndex?: number) => void;
  expGain?: number | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  currentEnemies: Enemy[];
  targetIndex: number;
  equippedSkills: (SkillInstance | null)[];
  setEquippedSkills?: React.Dispatch<React.SetStateAction<(SkillInstance | null)[]>>;
  onOpenSkillManagement?: () => void;
  setActiveSkill?: React.Dispatch<React.SetStateAction<SkillInstance | null>>;
}

const BattleInterface: React.FC<BattleInterfaceProps> = ({
  player,
  onSubmit,
  onSkillUse,
  expGain: _expGain, // 使用しなくなったため、_を付けて無視する変数とする
  inputRef,
  currentEnemies,
  targetIndex,
  equippedSkills,
  setEquippedSkills,
  onOpenSkillManagement,
  setActiveSkill
}) => {
  void currentEnemies;
  void setEquippedSkills;
  void _expGain; // 無視する変数

  const [userInput, setUserInput] = useState("");
  const [shouldSelectInput, setShouldSelectInput] = useState(false);
  
  // スキル関連の状態
  const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null);
  const [hoveredSkillIndex, setHoveredSkillIndex] = useState<number | null>(null);
  void hoveredSkillIndex;
  
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

    // アクティブなスキルがある場合はクリア
    setActiveSkillIndex(null);
    if (setActiveSkill) setActiveSkill(null); // activeSkillもクリア（存在する場合）
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      processSubmit();
    }
  };

  // スキル使用処理 - トグル機能を追加
  const handleSkillUse = (skillIndex: number) => {
    const selectedSkill = equippedSkills[skillIndex];
    
    if (!selectedSkill) return;
    
    // 現在選択中のスキルが再度押された場合はキャンセル
    if (activeSkillIndex === skillIndex) {
      setActiveSkillIndex(null);
      if (setActiveSkill) setActiveSkill(null); // 存在する場合のみ
      return;
    }
    
    // コマンド直接発動型のスキル
    if (selectedSkill.activationTiming === 'onCommand') {
      // スキルを実行
      onSkillUse(selectedSkill, targetIndex);
      // アクティブスキルをリセット
      setActiveSkillIndex(null);
      if (setActiveSkill) setActiveSkill(null); // 存在する場合のみ
    } 
    // 入力と組み合わせて使うスキル（例：正解時に発動するスキル）
    else if (selectedSkill.activationTiming === 'onCorrectAnswer') {
      // アクティブなスキルとして設定し、setActiveSkillも呼び出す
      if (setActiveSkill) setActiveSkill(selectedSkill); // 存在する場合のみ
      setActiveSkillIndex(skillIndex);
    }
  };

  // 常にコンパクトモードスタイルを適用
  return (
    <div 
      className="w-full flex flex-col justify-start mt-6 bg-gray-900 text-white border-t border-gray-700 transition-all duration-300"
    >
      {/* 入力フィールドのラッパー */}
      <div className="input-wrapper px-2 mb-2 flex items-center">
        {/* メインの入力フィールド - サイズを元に戻す */}
        <div className="flex-1">
          <input
            type="text"
            autoFocus
            className="w-full p-2 text-base bg-amber-200 text-black rounded-l"
            value={userInput}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={activeSkillIndex !== null ? "正解を入力してスキル発動" : "正しい解答を入力..."}
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
        </div>
        
        {/* スキルバーとスキル管理ボタン - 小さいサイズで */}
        <div className="ml-2 flex items-center">
          <SkillBar
            skills={equippedSkills}
            player={player}
            onSkillUse={handleSkillUse}
            activeSkillIndex={activeSkillIndex}
            inputRef={inputRef}
            onSkillHover={setHoveredSkillIndex}
          />
          
          {/* スキル管理ボタン - 小さいサイズに */}
          {onOpenSkillManagement && (
            <button 
              className="h-8 w-6 ml-1 bg-gray-700 rounded-md hover:bg-gray-600 text-white flex items-center justify-center"
              onClick={onOpenSkillManagement}
              title="スキル管理"
            >
              <span className="text-xs">⚙️</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BattleInterface;