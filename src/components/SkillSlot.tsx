// src/components/SkillSlot.tsx - タッチイベント対応版
import React from 'react';
import { Skill } from '../models/Skill';

interface SkillSlotProps {
  skill: Skill | null;
  index: number;
  isActive: boolean;
  cooldown: number;
  onClick: (index: number) => void;
  disabled?: boolean;
}

const SkillSlot: React.FC<SkillSlotProps> = ({
  skill,
  index,
  isActive,
  cooldown,
  onClick,
  disabled = false
}) => {
  // スロットがクリックされた時の処理
  const handleClick = () => {
    if (!disabled && skill) {
      onClick(index);
    }
  };

  // 空のスロットを表示
  if (!skill) {
    return (
      <div 
        className="w-8 h-8 bg-gray-700 rounded-md border border-gray-500 flex items-center justify-center cursor-pointer text-xs" 
        onClick={handleClick}
      >
        <span className="text-gray-400 text-xs">空</span>
      </div>
    );
  }

  return (
    <div
      className={`
        w-8 h-8 rounded-md border 
        ${isActive ? 'border-yellow-400 bg-yellow-700/50' : 'border-gray-600 bg-gray-800'} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-700'}
        relative overflow-hidden
      `}
      onClick={handleClick}
      
    >
      {/* スキルアイコン（準備ができたら実際の画像を使用） */}
      <div className="w-full h-full flex items-center justify-center text-white">
        {skill.icon ? (
          <img 
            src={skill.icon} 
            alt={skill.name} 
            className="w-6 h-6 object-contain"
          />
        ) : (
          // アイコンがない場合のフォールバック
          <div className="text-center">
            <span className="text-[8px] font-bold">{skill.name.substring(0, 3)}</span>
          </div>
        )}
      </div>

      {/* クールダウン表示 */}
      {cooldown > 0 && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
          <span className="text-white text-xs font-bold">{cooldown}</span>
        </div>
      )}

      {/* MP不足警告 */}
      {skill.mpCost > 0 && disabled && cooldown === 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-center">
          <span className="text-white text-[6px]">MP不足</span>
        </div>
      )}
    </div>
  );
};

export default SkillSlot;