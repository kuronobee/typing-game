// src/components/SkillBar.tsx - ホバー機能追加版
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
  onSkillHover?: (index: number | null) => void; // ホバー機能用の新しいプロパティ
}

const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  player,
  onSkillUse,
  activeSkillIndex,
  inputRef,
  onSkillHover
}) => {
  // スキルスロットが選択された時の処理
  const handleSkillClick = (index: number) => {
    inputRef.current?.focus();  // 入力フィールドにフォーカスする
    const skill = skills[index];
    
    // スキルが存在し、使用可能な場合
    if (skill && skill.canUse(player)) {
      onSkillUse(index);
    }
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
            cooldown={skill?.state.remainingCooldown || 0}
            onClick={handleSkillClick}
            disabled={skill ? !skill.canUse(player) : true}
          />
        </div>
      ))}
    </div>
  );
};

export default SkillBar;