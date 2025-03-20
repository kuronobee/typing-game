// src/components/SkillBar.tsx - サイズ調整版
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
}

const SkillBar: React.FC<SkillBarProps> = ({
  skills,
  player,
  onSkillUse,
  activeSkillIndex,
  inputRef
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
  
  return (
    <div className="flex space-x-1 bg-gray-900/70 p-1 rounded-lg h-10 items-center">
      {skills.map((skill, index) => (
        <SkillSlot
          key={index}
          skill={skill}
          index={index}
          isActive={activeSkillIndex === index}
          cooldown={skill?.state.remainingCooldown || 0}
          onClick={handleSkillClick}
          disabled={skill ? !skill.canUse(player) : true}
        />
      ))}
    </div>
  );
};

export default SkillBar;