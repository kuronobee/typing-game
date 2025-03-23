// src/components/SkillBar.tsx - トグル機能サポート版
import React from 'react';
import SkillSlot from './SkillSlot';
import { Skill } from '../models/Skill';
import { Player } from '../models/Player';

interface SkillBarProps {
  skills: (Skill | null)[];
  player: Player;
  onSkillUse: (skillIndex: number) => void;
  activeSkillIndex: number | null;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSkillHover?: (index: number | null) => void;
  activeKeyIndex?: number | null;   // ファンクションキーのインデックス
}

const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  player,
  onSkillUse,
  activeSkillIndex,
  inputRef,
  onSkillHover,
  activeKeyIndex = null,
}) => {
  // スキルスロットが選択された時の処理
  const handleSkillClick = (index: number) => {
    inputRef.current?.focus();  // 入力フィールドにフォーカスする
    onSkillUse(index);
  };

  // スキルスロットへのマウスイベント処理
  const handleMouseEnter = (index: number) => {
    if (onSkillHover && skills[index]) {
      onSkillHover(index);
    }
  };

  const handleMouseLeave = () => {
    if (onSkillHover) {
      onSkillHover(null);
    }
  };

  const isSkillDisabled = (skill: Skill | null, index: number): boolean => {
    if (!skill) return true;
    
    // アクティブなスキルは選択解除のために常に有効
    if (activeSkillIndex === index) return false;
    
    // それ以外はMPとクールダウンをチェック
    return !skill.canUse(player);
  };
  
  return (
    <div className="flex space-x-1 bg-gray-900/70 p-1 rounded-lg h-10 items-center">
      {skills.map((skill, index) => (
        <div 
          key={index}
          onMouseEnter={() => handleMouseEnter(index)}
          onMouseLeave={handleMouseLeave}
          // タッチデバイス用
          onTouchStart={() => handleMouseEnter(index)}
        >
          <SkillSlot
            skill={skill}
            index={index}
            isActive={activeSkillIndex === index}
            isKeyPressed={activeKeyIndex === index} // ファンクションキーのインデックス
            cooldown={skill?.state.remainingCooldown || 0}
            onClick={handleSkillClick}
            disabled={isSkillDisabled(skill, index)}
          />
        </div>
      ))}
    </div>
  );
};

export default SkillBar;