// src/components/SkillManagement.tsx
import React, { useState, useEffect } from 'react';
import { Skill, SkillInstance } from '../models/Skill';
import { createSkillInstance } from '../data/skillData';

interface SkillManagementProps {
  equippedSkills: (Skill | null)[];
  onEquipSkill: (skillId: string, slotIndex: number) => void;
  onUnequipSkill: (slotIndex: number) => void;
  playerLevel: number;
  onClose: () => void;
  availableSkillIds: string[]; // プレイヤーが持っているスキルのID
}

const SkillManagement: React.FC<SkillManagementProps> = ({
  equippedSkills,
  onEquipSkill,
  onUnequipSkill,
  playerLevel,
  onClose,
  availableSkillIds
}) => {
  // スキルリストと選択中のスロット
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  const [skillListVisible, setSkillListVisible] = useState(false);

  // 利用可能なスキルをロード
  useEffect(() => {
    // プレイヤーレベルに基づいて利用可能なスキルをフィルタリング
    const skills = availableSkillIds
      .map(id => {
        try {
          return createSkillInstance(id);
        } catch (error) {
          console.error(`Error creating skill instance for ${id}:`, error);
          return null;
        }
      })
      .filter((skill): skill is SkillInstance => skill !== null);
    
    setAvailableSkills(skills);
  }, [availableSkillIds, playerLevel]);

  // スロット選択時の処理
  const handleSlotSelect = (index: number) => {
    setSelectedSlot(index);
    setSkillListVisible(true);
  };

  // スキル装備時の処理
  const handleEquipSkill = (skillId: string) => {
    if (selectedSlot !== null) {
      onEquipSkill(skillId, selectedSlot);
      setSkillListVisible(false);
      setSelectedSlot(null);
    }
  };

  // スキル外し時の処理
  const handleUnequipSkill = (index: number) => {
    onUnequipSkill(index);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-100">
      <div className="bg-gray-800 rounded-lg p-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl text-white font-bold">スキル管理</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* 装備中スキルスロット */}
        <div className="mb-6">
          <h3 className="text-lg text-white mb-2">装備中のスキル</h3>
          <div className="flex space-x-2">
            {equippedSkills.map((skill, index) => (
              <div 
                key={index}
                className="w-16 h-16 bg-gray-700 rounded-md border border-gray-500 flex flex-col items-center justify-center cursor-pointer relative"
                onClick={() => handleSlotSelect(index)}
              >
                {skill ? (
                  <>
                    {skill.icon ? (
                      <img 
                        src={skill.icon} 
                        alt={skill.name} 
                        className="w-10 h-10 object-contain"
                      />
                    ) : (
                      <div className="text-white text-xs text-center">{skill.name}</div>
                    )}
                    <div className="text-xs text-gray-300 mt-1">MP: {skill.mpCost}</div>
                    
                    {/* 装備解除ボタン */}
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnequipSkill(index);
                      }}
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400">空</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* スキル選択リスト（スロット選択時のみ表示） */}
        {skillListVisible && (
          <div className="mb-4">
            <h3 className="text-lg text-white mb-2">利用可能なスキル</h3>
            <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto">
              {availableSkills.map((skill) => {
                // すでに装備済みのスキルを確認
                const isEquipped = equippedSkills.some(
                  equippedSkill => equippedSkill && equippedSkill.id === skill.id
                );
                
                return (
                  <div 
                    key={skill.id}
                    className={`p-2 rounded-md border flex flex-col items-center ${
                      isEquipped 
                        ? 'bg-gray-600 border-gray-500 cursor-not-allowed opacity-50' 
                        : 'bg-gray-700 border-gray-500 cursor-pointer hover:bg-gray-600'
                    }`}
                    onClick={() => !isEquipped && handleEquipSkill(skill.id)}
                  >
                    {skill.icon ? (
                      <img 
                        src={skill.icon} 
                        alt={skill.name} 
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <div className="w-8 h-8 flex items-center justify-center">
                        <span className="text-white text-xs">{skill.name.substring(0, 1)}</span>
                      </div>
                    )}
                    <div className="text-xs text-white mt-1">{skill.name}</div>
                    <div className="text-xs text-blue-300">MP: {skill.mpCost}</div>
                    
                    {isEquipped && (
                      <div className="text-xs text-yellow-400 mt-1">装備中</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 閉じるボタン */}
        <div className="flex justify-center mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillManagement;