// src/components/SkillSlot.tsx - トグル機能を強化したバージョン
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
    // 空スロットまたは無効なスキルの場合は何もしない（ただし視覚的フィードバックは必要）
    if (!skill) return;
    
    // cooldownが0でないまたはMP不足の場合も選択はするが、実際の使用はできない
    // アクティブなスキルをキャンセルするときは、disabled状態でも許可する
    if (isActive || !disabled) {
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

  // スキルタイプに基づいたボーダースタイル（トグル可能スキルは異なるスタイル）
  const getBorderStyle = () => {
    if (isActive) {
      return 'border-yellow-400 bg-yellow-700/50 pulse-active'; // アクティブ時は脈動エフェクト追加
    } else if (skill.activationTiming === 'onCorrectAnswer') {
      return 'border-blue-500 bg-gray-800 hover:border-blue-400'; // 選択可能なスキルは青色ボーダー
    } else {
      return 'border-gray-600 bg-gray-800 hover:bg-gray-700'; // 通常スキル
    }
  };

  return (
    <div
      className={`
        w-8 h-8 rounded-md border 
        ${getBorderStyle()} 
        ${disabled && !isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        relative overflow-hidden
      `}
      onClick={handleClick}
      // ツールチップ表示用
      title={`${skill.name}${isActive ? ' (選択中 - クリックでキャンセル)' : ''}`}
    >
      {/* スキルアイコン */}
      <div className="w-full h-full flex items-center justify-center text-white">
        {skill.icon ? (
          <img 
            src={skill.icon} 
            alt={skill.name} 
            className={`w-6 h-6 object-contain ${isActive ? 'skill-icon-glow' : ''}`}
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
      {skill.mpCost > 0 && disabled && cooldown === 0 && !isActive && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-800/80 text-center">
          <span className="text-white text-[6px]">MP不足</span>
        </div>
      )}
      
      {/* アクティブ状態表示（視覚的フィードバック強化） */}
      {isActive && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
      )}
    </div>
  );
};

export default SkillSlot;