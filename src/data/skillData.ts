// src/data/skillData.ts
import { ISkill, SkillInstance } from '../models/Skill';
import { HealSkill, FireSpellSkill } from '../models/SkillImplementations';

// 基本スキルデータ定義
export const skillData: ISkill[] = [
  // 回復スキル
  {
    id: 'heal_minor',
    name: '小回復',
    description: 'HPを少量回復する (20 + レベル×0.5)',
    type: 'heal',
    mpCost: 5,
    cooldown: 2,
    icon: new URL("../assets/icons/heal_minor.png", import.meta.url).toString(), // 実際のアイコンパスに置き換えること
    activationTiming: 'onCommand',
    targetType: 'self'
  },
  {
    id: 'heal_medium',
    name: '中回復',
    description: 'HPを中程度回復する (40 + レベル×0.5)',
    type: 'heal',
    mpCost: 10,
    cooldown: 3,
    icon: new URL("../assets/icons/heal_medium.png", import.meta.url).toString(),
    activationTiming: 'onCommand',
    targetType: 'self'
  },
  {
    id: 'heal_major',
    name: '大回復',
    description: 'HPを大きく回復する (80 + レベル×0.5)',
    type: 'heal',
    mpCost: 20,
    cooldown: 5,
    icon: new URL("../assets/icons/heal_major.png", import.meta.url).toString(),
    activationTiming: 'onCommand',
    targetType: 'self'
  },
  
  // 炎魔法スキル
  {
    id: 'fire_bolt',
    name: 'ファイアボルト',
    description: '単体に炎ダメージを与える (15 + 力×0.5)',
    type: 'damage',
    mpCost: 5,
    cooldown: 1,
    icon: new URL("../assets/icons/fire_bolt.png", import.meta.url).toString(),
    activationTiming: 'onCorrectAnswer',
    targetType: 'singleEnemy',
    requiresAnswer: true
  },
  {
    id: 'fire_ball',
    name: 'ファイアボール',
    description: '単体に中程度の炎ダメージを与える (30 + 力×0.5)',
    type: 'damage',
    mpCost: 12,
    cooldown: 3,
    icon: new URL("../assets/icons/fire_ball.png", import.meta.url).toString(),
    activationTiming: 'onCorrectAnswer',
    targetType: 'singleEnemy',
    requiresAnswer: true
  },
  {
    id: 'fire_storm',
    name: 'ファイアストーム',
    description: '全ての敵に炎ダメージを与える (20 + 力×0.3)',
    type: 'damage',
    mpCost: 18,
    cooldown: 4,
    icon: new URL("../assets/icons/fire_storm.png", import.meta.url).toString(),
    activationTiming: 'onCorrectAnswer',
    targetType: 'allEnemies',
    requiresAnswer: true
  },
  
  // バフ/デバフスキル例
  // {
  //   id: 'defense_up',
  //   name: '防御強化',
  //   description: '3ターンの間、防御力が30%上昇する',
  //   type: 'buff',
  //   mpCost: 8,
  //   cooldown: 4,
  //   icon: new URL("../assets/icons/defense_up.png", import.meta.url).toString(),
  //   activationTiming: 'onCommand',
  //   targetType: 'self'
  // },
  // {
  //   id: 'attack_up',
  //   name: '攻撃強化',
  //   description: '3ターンの間、攻撃力が30%上昇する',
  //   type: 'buff',
  //   mpCost: 10,
  //   cooldown: 4,
  //   icon: new URL("../assets/icons/attack_up.png", import.meta.url).toString(),
  //   activationTiming: 'onCommand',
  //   targetType: 'self'
  // },
  // {
  //   id: 'mp_recovery',
  //   name: 'MP回復',
  //   description: 'MPを15回復する',
  //   type: 'heal',
  //   mpCost: 0,
  //   cooldown: 5,
  //   icon: new URL("../assets/icons/mp_recovery.png", import.meta.url).toString(),
  //   activationTiming: 'onCommand',
  //   targetType: 'self'
  // }
];

// スキルインスタンス生成ヘルパー関数
export function createSkillInstance(skillId: string): SkillInstance {
  const skillTemplate = skillData.find(s => s.id === skillId);
  
  if (!skillTemplate) {
    throw new Error(`Skill with ID ${skillId} not found`);
  }
  
  switch (skillId) {
    // 回復スキル
    case 'heal_minor':
      return new HealSkill(skillTemplate, 20);
    case 'heal_medium':
      return new HealSkill(skillTemplate, 40);
    case 'heal_major':
      return new HealSkill(skillTemplate, 80);
      
    // 炎魔法スキル
    case 'fire_bolt':
      return new FireSpellSkill(skillTemplate, 15);
    case 'fire_ball':
      return new FireSpellSkill(skillTemplate, 30);
    case 'fire_storm':
      return new FireSpellSkill(skillTemplate, 20);
      
    // その他のスキルタイプは今後実装
    default:
      throw new Error(`Skill implementation for ${skillId} not available`);
  }
}

// プレイヤーが初期状態で所持しているスキル
export const initialPlayerSkills = [
  'heal_minor',
  'fire_bolt',

  //'defense_up'
];