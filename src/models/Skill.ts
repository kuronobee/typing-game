// src/models/Skill.ts
import { Player } from "./Player";
import { Enemy } from "./EnemyModel";
import { HealSkill, FireSpellSkill } from "./SkillImplementations";
// スキルの種類（回復、ダメージ、バフ/デバフ、特殊効果など）
export type SkillType = "heal" | "damage" | "buff" | "debuff" | "special";

// スキル発動のタイミング
export type ActivationTiming = 
  | "passive" // 常時発動（セットするだけで効果がある）
  | "onCorrectAnswer" // 正解時に発動
  | "onCommand" // コマンド入力で発動（問題解答とは別）
  | "onCombo" // コンボ数に応じて発動
  | "onEnemyDefeat" // 敵撃破時に発動
  | "onDamage"; // ダメージを受けた時に発動

// スキルの効果対象
export type TargetType = "self" | "singleEnemy" | "allEnemies" | "randomEnemy";
// すべてのスキルタイプを含むユニオン型
export type SkillInstance = HealSkill | FireSpellSkill;
// スキルデータインターフェイス
export interface ISkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  mpCost: number;
  cooldown: number; // ターン数での冷却時間
  icon: string; // アイコンのパス
  activationTiming: ActivationTiming;
  targetType: TargetType;
  requiresAnswer?: boolean; // 問題の正解入力が必要かどうか
  isLocked?: boolean; // プレイヤーがまだ獲得していないスキル
}

// スキルのステータス管理用インターフェイス（実行時情報）
export interface SkillState {
  remainingCooldown: number;
  isActive: boolean;
  duration?: number; // 効果持続時間（該当する場合）
}

// スキル実行結果のインターフェイス
export interface SkillResult {
  success: boolean;
  message: string;
  healAmount?: number;
  damageAmount?: number;
  targetIndex?: number;
  statusEffect?: any; // ステータス効果があれば
}

// スキル基本クラス
export class Skill implements ISkill {
  id: string;
  name: string;
  description: string;
  type: SkillType;
  mpCost: number;
  cooldown: number;
  icon: string;
  activationTiming: ActivationTiming;
  targetType: TargetType;
  requiresAnswer?: boolean;
  isLocked?: boolean;
  state: SkillState;

  constructor(skillData: ISkill) {
    this.id = skillData.id;
    this.name = skillData.name;
    this.description = skillData.description;
    this.type = skillData.type;
    this.mpCost = skillData.mpCost;
    this.cooldown = skillData.cooldown;
    this.icon = skillData.icon;
    this.activationTiming = skillData.activationTiming;
    this.targetType = skillData.targetType;
    this.requiresAnswer = skillData.requiresAnswer || false;
    this.isLocked = skillData.isLocked || false;
    
    // 初期状態設定
    this.state = {
      remainingCooldown: 0,
      isActive: false
    };
  }

  // スキルが使用可能かチェック
  canUse(player: Player): boolean {
    return (
      player.mp >= this.mpCost && 
      this.state.remainingCooldown === 0 &&
      !this.isLocked
    );
  }

  // クールダウンを進める
  decreaseCooldown(): void {
    if (this.state.remainingCooldown > 0) {
      this.state.remainingCooldown--;
    }
  }

  // スキル使用後の処理
  afterUse(player: Player): void {
    this.state.remainingCooldown = 0; //this.cooldown;
    player.mp = Math.max(0, player.mp - this.mpCost);
  }

  // スキル実行のための基本メソッド（サブクラスでオーバーライド）
  execute(player: Player, targets: Enemy[] | Enemy, targetIndex?: number): SkillResult {
    void targets;
    void targetIndex;
    if (!this.canUse(player)) {
      return {
        success: false,
        message: "スキルを使用できません"
      };
    }
    
    // 実装はサブクラスで行う
    return {
      success: true,
      message: `${this.name}を使用した`
    };
  }
}