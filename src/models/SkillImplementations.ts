// src/models/SkillImplementations.ts
import { Skill, SkillResult } from './Skill';
import { Player } from './Player';
import { Enemy } from './EnemyModel';

// 回復スキルクラス
export class HealSkill extends Skill {
  healPower: number;

  constructor(baseSkill: any, healPower: number) {
    super(baseSkill);
    this.healPower = healPower;
  }

  execute(player: Player, targets: Enemy[] | Enemy, targetIndex?: number): SkillResult {
    void targets;
    void targetIndex;
    if (!this.canUse(player)) {
      return {
        success: false,
        message: "MPが足りないか、クールダウン中です"
      };
    }

    // 回復量計算（基本値 + プレイヤーレベルによるボーナス）
    const healAmount = this.healPower + Math.floor(player.level * 0.5);
    
    // 実際の回復処理は Player クラスのメソッドで行う
    const newHP = Math.min(player.hp + healAmount, player.maxHP);
    const actualHealAmount = newHP - player.hp;
    
    // プレイヤーの状態を更新
    const updatedPlayer = new Player(
      newHP,
      player.maxHP,
      player.mp - this.mpCost,
      player.maxMP,
      player.defense,
      player.magicDefense,
      player.level,
      player.exp,
      player.totalExp,
      player.speed,
      player.attack,
      player.luck,
      player.power,
      player.statusEffects
    );
    void updatedPlayer;

    // 状態更新
    this.afterUse(player);
    
    return {
      success: true,
      message: `${this.name}を使用！ HPが${actualHealAmount}回復した！`,
      healAmount: actualHealAmount
    };
  }
}

// 炎魔法スキルクラス
export class FireSpellSkill extends Skill {
  basePower: number;
  
  constructor(baseSkill: any, basePower: number) {
    super(baseSkill);
    this.basePower = basePower;
  }
  
  execute(player: Player, targets: Enemy[] | Enemy, targetIndex?: number): SkillResult {
    console.log("fire発動");
    if (!this.canUse(player)) {
      return {
        success: false,
        message: "MPが足りないか、クールダウン中です"
      };
    }
    
    // 単体ターゲットの場合
    if (this.targetType === "singleEnemy" && targetIndex !== undefined) {
      const target = Array.isArray(targets) ? targets[targetIndex] : targets;
      
      if (!target || target.defeated) {
        return {
          success: false,
          message: "対象が存在しないか、すでに倒されています"
        };
      }
      
      // ダメージ計算 (基本値 + レベルボーナス + 乱数要素)
      const magicPower = player.power || 10;
      const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 ~ 1.1の範囲
      const damageAmount = Math.floor((this.basePower + magicPower * 0.5) * randomFactor);
      
      // 実際のダメージ処理はターゲットのメソッドで行う
      target.takeDamage(damageAmount);
      
      // 状態更新
      this.afterUse(player);
      console.log("fire発動");
      return {
        success: true,
        message: `${target.name}に${this.name}で${damageAmount}のダメージ！`,
        damageAmount,
        targetIndex
      };
    }
    
    // 全体攻撃の場合
    if (this.targetType === "allEnemies" && Array.isArray(targets)) {
      let totalDamage = 0;
      const aliveTargets = targets.filter(t => !t.defeated);
      
      if (aliveTargets.length === 0) {
        return {
          success: false,
          message: "対象が存在しません"
        };
      }
      
      // 各敵に対してダメージ計算
      aliveTargets.forEach(target => {
        const magicPower = player.power || 10;
        const randomFactor = 0.9 + Math.random() * 0.2;
        // 全体攻撃の場合は単体よりも威力を下げる
        const damageAmount = Math.floor((this.basePower * 0.7 + magicPower * 0.3) * randomFactor);
        
        target.takeDamage(damageAmount);
        totalDamage += damageAmount;
      });
      
      // 状態更新
      this.afterUse(player);
      
      return {
        success: true,
        message: `敵全体に${this.name}で合計${totalDamage}のダメージ！`,
        damageAmount: totalDamage
      };
    }
    
    return {
      success: false,
      message: "対象が正しく指定されていません"
    };
  }
}