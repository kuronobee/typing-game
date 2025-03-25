// src/hooks/useSkillManagement.ts
import { useState, useEffect } from 'react';
import { SkillInstance } from "../models/Skill";
import { createSkillInstance, initialPlayerSkills } from "../data/skillData";
import { MessageType } from "../components/MessageDisplay";

export function useSkillManagement(setMessage: (message: MessageType) => void) {
  // スキル関連の状態
  const [activeSkill, setActiveSkill] = useState<SkillInstance | null>(null);
  const [equippedSkills, setEquippedSkills] = useState<(SkillInstance | null)[]>([]);
  const [skillAnimationInProgress, setSkillAnimationInProgress] = useState<boolean>(false);
  const [availableSkillIds, setAvailableSkillIds] = useState<string[]>(initialPlayerSkills);
  const [showSkillManagement, setShowSkillManagement] = useState(false);
  const [newlyAcquiredSkill, setNewlyAcquiredSkill] = useState<SkillInstance | null>(null);
  const [activeKeyIndex, setActiveKeyIndex] = useState<number | null>(null);
  
  // 初回マウント時の初期化
  useEffect(() => {
    // 初期スキルをセットアップ
    const initialSkillsArray = initialPlayerSkills.map((skillId) => {
      try {
        return createSkillInstance(skillId);
      } catch (error) {
        console.error(`Error creating skill instance for ${skillId}:`, error);
        return null;
      }
    });

    // 3スロット分のスキル配列を用意（空きスロットはnull）
    const skillsWithEmptySlots = [...initialSkillsArray];
    while (skillsWithEmptySlots.length < 3) {
      skillsWithEmptySlots.push(null);
    }

    setEquippedSkills(skillsWithEmptySlots);
  }, []);
  
  // 新しいスキルの獲得
  const acquireNewSkill = (skillId: string) => {
    // すでに所持しているスキルは追加しない
    if (availableSkillIds.includes(skillId)) {
      console.log(`スキル「${skillId}」はすでに獲得済みです`);
      return;
    }

    console.log(`新しいスキル「${skillId}」を獲得`);

    try {
      // スキルインスタンスを作成
      const newSkill = createSkillInstance(skillId);

      // 状態を更新
      setAvailableSkillIds(prev => [...prev, skillId]);

      // スキル獲得通知を表示
      setNewlyAcquiredSkill(newSkill);

      // システムメッセージも表示（バックアップとして）
      setMessage({
        text: `新しいスキル「${newSkill.name}」を習得した！`,
        sender: "system",
      });
    } catch (error) {
      console.error(`スキル「${skillId}」の取得に失敗しました:`, error);
      setMessage({
        text: `スキル「${skillId}」の取得に失敗しました`,
        sender: "system",
      });
    }
  };
  
  // スキル獲得通知を閉じる処理
  const handleCloseSkillNotification = () => {
    setNewlyAcquiredSkill(null);
  };

  // スキル装備の処理
  const handleEquipSkill = (skillId: string, slotIndex: number) => {
    try {
      const newSkill = createSkillInstance(skillId);

      setEquippedSkills((prev) => {
        const newSkills = [...prev];
        newSkills[slotIndex] = newSkill;
        return newSkills;
      });
    } catch (error) {
      console.error(`Error equipping skill ${skillId}:`, error);
      setMessage({
        text: "スキルの装備に失敗しました",
        sender: "system",
      });
    }
  };

  // スキル解除の処理
  const handleUnequipSkill = (slotIndex: number) => {
    setEquippedSkills((prev) => {
      const newSkills = [...prev];
      newSkills[slotIndex] = null;
      return newSkills;
    });
  };
  
  return {
    // 状態
    activeSkill, setActiveSkill,
    equippedSkills, setEquippedSkills,
    skillAnimationInProgress, setSkillAnimationInProgress,  // 追加
    availableSkillIds,
    showSkillManagement, setShowSkillManagement,
    newlyAcquiredSkill,
    activeKeyIndex, setActiveKeyIndex,
    
    // 関数
    acquireNewSkill,
    handleCloseSkillNotification,
    handleEquipSkill,
    handleUnequipSkill
  };
}