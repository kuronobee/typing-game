// src/handlers/SkillHandler.ts
import { SkillInstance, SkillResult } from '../models/Skill';
import { Player } from '../models/Player';
import { Enemy } from '../models/EnemyModel';
import { MessageType } from '../components/MessageDisplay';
import { ENEMY_HIT_ANIMATION_DURATION } from '../data/constants';

// スキルエフェクト表示用の型定義
export interface SkillEffectProps {
  type: 'heal' | 'damage' | 'buff' | 'debuff';
  targetPosition?: { x: number; y: number };
  value?: number;
  skillName?: string;
}

// 炎系スキルエフェクト表示用の型定義
export interface FireSkillEffectProps {
  skillName: string;
  targetPosition: { x: number; y: number };
  damageValue?: number;
  power: 'low' | 'medium' | 'high';
  onComplete?: () => void;
}

/**
 * スキル処理を一元管理するハンドラークラス
 */
export class SkillHandler {
  private player: Player;
  private currentEnemies: Enemy[];
  private setPlayer: React.Dispatch<React.SetStateAction<Player>>;
  private setMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;
  private setDamageDisplay: (targetIndex: number, damage: number) => void;
  private setHitFlag: (targetIndex: number, duration: number) => void;
  private showSkillEffect: (props: SkillEffectProps) => void;
  private showFireSkillEffect: (props: FireSkillEffectProps) => void;
  private checkStageCompletion: () => void;
  private setEnemyDefeatedMessage: (enemyName: string) => void;
  private findNextAliveEnemyIndex: (startIndex: number, enemies: Enemy[]) => number;
  private setTargetIndex: React.Dispatch<React.SetStateAction<number>>;
  private setActiveSkill: React.Dispatch<React.SetStateAction<SkillInstance | null>>;

  /**
   * コンストラクタ - 必要な状態更新関数を注入
   */
  constructor(
    player: Player,
    currentEnemies: Enemy[],
    setPlayer: React.Dispatch<React.SetStateAction<Player>>,
    setMessage: React.Dispatch<React.SetStateAction<MessageType | null>>,
    setDamageDisplay: (targetIndex: number, damage: number) => void,
    setHitFlag: (targetIndex: number, duration: number) => void,
    showSkillEffect: (props: SkillEffectProps) => void,
    showFireSkillEffect: (props: FireSkillEffectProps) => void,
    checkStageCompletion: () => void,
    setEnemyDefeatedMessage: (enemyName: string) => void,
    findNextAliveEnemyIndex: (startIndex: number, enemies: Enemy[]) => number,
    setTargetIndex: React.Dispatch<React.SetStateAction<number>>,
    setActiveSkill: React.Dispatch<React.SetStateAction<SkillInstance | null>>
  ) {
    this.player = player;
    this.currentEnemies = currentEnemies;
    this.setPlayer = setPlayer;
    this.setMessage = setMessage;
    this.setDamageDisplay = setDamageDisplay;
    this.setHitFlag = setHitFlag;
    this.showSkillEffect = showSkillEffect;
    this.showFireSkillEffect = showFireSkillEffect;
    this.checkStageCompletion = checkStageCompletion;
    this.setEnemyDefeatedMessage = setEnemyDefeatedMessage;
    this.findNextAliveEnemyIndex = findNextAliveEnemyIndex;
    this.setTargetIndex = setTargetIndex;
    this.setActiveSkill = setActiveSkill;
  }

  /**
   * プレイヤーとエネミーの状態を更新
   */
  updateState(player: Player, currentEnemies: Enemy[]) {
    this.player = player;
    this.currentEnemies = currentEnemies;
  }

  /**
   * スキル使用ハンドラのメインメソッド
   */
  handleSkillUse(skill: SkillInstance, targetIndex?: number): void {
    // スキルがコマンド型（即時発動）の場合
    if (skill.activationTiming === "onCommand") {
      this.handleCommandSkill(skill, targetIndex);
    } else {
      // コマンド型でないスキルは活性化して後で使用
      this.setActiveSkill(skill);
    }
  }

  /**
   * コマンド型スキル（即時発動）の処理
   */
  private handleCommandSkill(skill: SkillInstance, targetIndex?: number): void {
    // 単体敵対象スキルの場合は targetIndex を確認
    if (skill.targetType === "singleEnemy" && targetIndex === undefined) {
      this.setMessage({
        text: "対象の敵を選択してください。",
        sender: "system",
      });
      return;
    }

    // スキルが使用可能かチェック
    if (!skill.canUse(this.player)) {
      this.setMessage({
        text: "MPが足りないか、クールダウン中です。",
        sender: "system",
      });
      return;
    }

    // スキルタイプに応じた処理
    switch (skill.type) {
      case "heal":
        this.handleHealSkill(skill);
        break;
      case "damage":
        this.handleDamageSkill(skill, targetIndex);
        break;
      case "buff":
        this.handleBuffSkill(skill);
        break;
      case "debuff":
        this.handleDebuffSkill(skill, targetIndex);
        break;
      default:
        this.handleSpecialSkill(skill, targetIndex);
        break;
    }

    // アクティブスキルをリセット
    this.setActiveSkill(null);
  }

  /**
   * 回復系スキル処理
   */
  private handleHealSkill(skill: SkillInstance): void {
    // スキル実行
    const result = skill.execute(this.player, this.currentEnemies);

    if (result.success) {
      // プレイヤー状態の更新（MP消費と回復）
      this.setPlayer((prev) => {
        const newHP = Math.min(
          prev.hp + (result.healAmount || 0),
          prev.maxHP
        );
        return new Player(
          newHP,
          prev.maxHP,
          prev.mp - skill.mpCost,
          prev.maxMP,
          prev.defense,
          prev.magicDefense,
          prev.level,
          prev.exp,
          prev.totalExp,
          prev.speed,
          prev.attack,
          prev.luck,
          prev.power,
          prev.statusEffects
        );
      });

      // 回復エフェクトを表示 - プレイヤー位置に表示
      this.showSkillEffect({
        type: "heal",
        targetPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 50 },
        value: result.healAmount,
        skillName: skill.name
      });

      // メッセージ表示
      this.setMessage({
        text: result.message,
        sender: "player",
      });
    } else {
      this.setMessage({
        text: result.message,
        sender: "system",
      });
    }
  }

  /**
   * ダメージ系スキル処理
   */
  private handleDamageSkill(skill: SkillInstance, targetIndex?: number): void {
    // スキルIDに基づいた個別処理
    if (skill.id === "fire_bolt") {
      this.handleFireBoltSkill(skill, targetIndex);
    } else if (skill.id === "fire_ball") {
      this.handleFireBallSkill(skill, targetIndex);
    } else if (skill.id === "fire_storm") {
      this.handleFireStormSkill(skill);
    } else {
      // 一般的なダメージスキル処理
      this.handleGenericDamageSkill(skill, targetIndex);
    }
  }

  /**
   * ファイアボルトスキル処理
   */
  private handleFireBoltSkill(skill: SkillInstance, targetIndex?: number): void {
    if (targetIndex === undefined) {
      this.setMessage({ text: "攻撃対象が定まっていない！", sender: "system" });
      return;
    }

    // MP消費処理（先に消費する）
    this.setPlayer((prev) => {
      return new Player(
        prev.hp,
        prev.maxHP,
        prev.mp - skill.mpCost,
        prev.maxMP,
        prev.defense,
        prev.magicDefense,
        prev.level,
        prev.exp,
        prev.totalExp,
        prev.speed,
        prev.attack,
        prev.luck,
        prev.power,
        prev.statusEffects
      );
    });

    // 事前にスキル結果を計算
    const result = skill.execute(this.player, this.currentEnemies, targetIndex);
    
    if (result.success && targetIndex !== undefined) {
      // 対象の敵の位置にファイアボルトエフェクトを表示
      const targetEnemy = this.currentEnemies[targetIndex];
      const enemyPosition = targetEnemy.positionOffset || { x: 0, y: 0 };

      // 画面中央を基準に、敵の位置にエフェクトを表示
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // アニメーション表示、onComplete時にダメージを適用する
      this.showFireSkillEffect({
        skillName: "ファイアボルト",
        targetPosition: {
          x: centerX + enemyPosition.x,
          y: centerY - 100 + enemyPosition.y,
        },
        damageValue: result.damageAmount,
        power: "low", // 低威力設定
        onComplete: () => {
          // アニメーション完了後にダメージを適用する
          if (result.targetIndex !== undefined) {
            // ダメージ表示とヒットアニメーション
            this.setDamageDisplay(
              result.targetIndex,
              result.damageAmount || 0
            );
            this.setHitFlag(
              result.targetIndex,
              ENEMY_HIT_ANIMATION_DURATION
            );

            // メッセージ表示
            this.setMessage({
              text: result.message,
              sender: "player",
            });
            
            // 対象の敵にダメージを適用
            const targetEnemy = this.currentEnemies[result.targetIndex];
            targetEnemy.takeDamage(result.damageAmount || 0);

            console.log(`敵の状態: HP=${targetEnemy.currentHP}, 倒された=${targetEnemy.defeated}`);

            // 敵が倒れたかチェック
            if (targetEnemy.defeated) {
              this.setEnemyDefeatedMessage(targetEnemy.name);

              // 次のターゲットを探す
              setTimeout(() => {
                const nextAliveIndex = this.findNextAliveEnemyIndex(
                  targetIndex,
                  this.currentEnemies
                );
                if (nextAliveIndex !== -1) {
                  this.setTargetIndex(nextAliveIndex);
                }
                
                // 全ての敵が倒されたかを確認して、ステージクリア処理
                const allDefeated = this.currentEnemies.every(e => e.defeated);
                console.log(`全ての敵が倒された: ${allDefeated}`);
                
                if (allDefeated) {
                  console.log("ステージクリア処理を実行");
                  this.checkStageCompletion();
                }
              }, 2000);
            }
          }
        }
      });
    }
  }

  /**
   * ファイアボールスキル処理
   */
  private handleFireBallSkill(skill: SkillInstance, targetIndex?: number): void {
    if (targetIndex === undefined) {
      this.setMessage({ text: "攻撃対象が定まっていない！", sender: "system" });
      return;
    }

    // MP消費処理
    this.setPlayer((prev) => {
      return new Player(
        prev.hp,
        prev.maxHP,
        prev.mp - skill.mpCost,
        prev.maxMP,
        prev.defense,
        prev.magicDefense,
        prev.level,
        prev.exp,
        prev.totalExp,
        prev.speed,
        prev.attack,
        prev.luck,
        prev.power,
        prev.statusEffects
      );
    });

    // スキル結果計算
    const result = skill.execute(this.player, this.currentEnemies, targetIndex);
    
    if (result.success && targetIndex !== undefined) {
      // 対象の敵の位置を取得
      const targetEnemy = this.currentEnemies[targetIndex];
      const enemyPosition = targetEnemy.positionOffset || { x: 0, y: 0 };
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // ファイアボールエフェクト表示
      this.showFireSkillEffect({
        skillName: "ファイアボール",
        targetPosition: {
          x: centerX + enemyPosition.x,
          y: centerY - 100 + enemyPosition.y,
        },
        damageValue: result.damageAmount,
        power: "medium", // 中威力設定
        onComplete: () => {
          // ダメージ適用処理（FireBoltと同様）
          if (result.targetIndex !== undefined) {
            this.setDamageDisplay(result.targetIndex, result.damageAmount || 0);
            this.setHitFlag(result.targetIndex, ENEMY_HIT_ANIMATION_DURATION);
            this.setMessage({ text: result.message, sender: "player" });
            
            const targetEnemy = this.currentEnemies[result.targetIndex];
            targetEnemy.takeDamage(result.damageAmount || 0);

            if (targetEnemy.currentHP <= 0) {
              this.setEnemyDefeatedMessage(targetEnemy.name);
              
              setTimeout(() => {
                const nextAliveIndex = this.findNextAliveEnemyIndex(
                  targetIndex,
                  this.currentEnemies
                );
                if (nextAliveIndex !== -1) {
                  this.setTargetIndex(nextAliveIndex);
                }
              }, 2000);
            }
            
            this.checkStageCompletion();
          }
        }
      });
    }
  }

  /**
   * ファイアストーム（全体攻撃）スキル処理
   */
  private handleFireStormSkill(skill: SkillInstance): void {
    // MP消費処理
    this.setPlayer((prev) => {
      return new Player(
        prev.hp,
        prev.maxHP,
        prev.mp - skill.mpCost,
        prev.maxMP,
        prev.defense,
        prev.magicDefense,
        prev.level,
        prev.exp,
        prev.totalExp,
        prev.speed,
        prev.attack,
        prev.luck,
        prev.power,
        prev.statusEffects
      );
    });

    // 生存している敵のみを対象に
    const aliveEnemies = this.currentEnemies.filter(enemy => !enemy.defeated);
    if (aliveEnemies.length === 0) {
      this.setMessage({ text: "対象となる敵がいません", sender: "system" });
      return;
    }

    // スキル結果計算
    const result = skill.execute(this.player, this.currentEnemies);
    
    if (result.success) {
      // 画面中央を基準に効果表示
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // 全体攻撃エフェクト
      this.showFireSkillEffect({
        skillName: "ファイアストーム",
        targetPosition: { x: centerX, y: centerY - 50 },
        damageValue: result.damageAmount,
        power: "high", // 高威力設定
        onComplete: () => {
          // 生存している全敵にダメージを適用
          let totalDamage = 0;
          let defeatedEnemies = 0;

          aliveEnemies.forEach((enemy, i) => {
            const enemyIndex = this.currentEnemies.indexOf(enemy);
            if (enemyIndex !== -1) {
              // 個別ダメージ計算（全体攻撃なので各敵に対して少し弱めのダメージ）
              const individualDamage = Math.floor((result.damageAmount || 0) * 0.7 / aliveEnemies.length);
              totalDamage += individualDamage;
              
              // ダメージエフェクト表示
              this.setDamageDisplay(enemyIndex, individualDamage);
              this.setHitFlag(enemyIndex, ENEMY_HIT_ANIMATION_DURATION);
              
              // ダメージ適用
              enemy.takeDamage(individualDamage);
              
              // 敵撃破判定
              if (enemy.currentHP <= 0) {
                defeatedEnemies++;
                // 各敵撃破メッセージは少し遅延させて表示
                setTimeout(() => {
                  this.setEnemyDefeatedMessage(enemy.name);
                }, 500 + i * 300);
              }
            }
          });

          // 結果メッセージ
          this.setMessage({
            text: `ファイアストームが敵全体に${totalDamage}ダメージ！${
              defeatedEnemies > 0 ? `${defeatedEnemies}体の敵を倒した！` : ''
            }`,
            sender: "player",
          });
          
          // ターゲット切り替え
          if (this.currentEnemies[targetIndex]?.defeated) {
            setTimeout(() => {
              const nextAliveIndex = this.findNextAliveEnemyIndex(
                targetIndex,
                this.currentEnemies
              );
              if (nextAliveIndex !== -1) {
                this.setTargetIndex(nextAliveIndex);
              }
            }, 2000);
          }
          
          // ステージクリア判定
          this.checkStageCompletion();
        }
      });
    }
  }

  /**
   * 一般的なダメージスキル処理
   */
  private handleGenericDamageSkill(skill: SkillInstance, targetIndex?: number): void {
    if (skill.targetType === "singleEnemy" && targetIndex === undefined) {
      this.setMessage({ text: "攻撃対象が定まっていない！", sender: "system" });
      return;
    }

    // MP消費
    this.setPlayer((prev) => {
      return new Player(
        prev.hp,
        prev.maxHP,
        prev.mp - skill.mpCost,
        prev.maxMP,
        prev.defense,
        prev.magicDefense,
        prev.level,
        prev.exp,
        prev.totalExp,
        prev.speed,
        prev.attack,
        prev.luck,
        prev.power,
        prev.statusEffects
      );
    });

    // スキル実行
    const result = skill.execute(this.player, this.currentEnemies, targetIndex);
    
    if (result.success) {
      // 単体ターゲットの場合
      if (skill.targetType === "singleEnemy" && targetIndex !== undefined) {
        const targetEnemy = this.currentEnemies[targetIndex];
        const enemyPosition = targetEnemy.positionOffset || { x: 0, y: 0 };
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        // ダメージエフェクト表示
        this.showSkillEffect({
          type: "damage",
          targetPosition: {
            x: centerX + enemyPosition.x,
            y: centerY - 100 + enemyPosition.y,
          },
          value: result.damageAmount,
          skillName: skill.name
        });

        // ダメージ表示とヒットアニメーション
        this.setDamageDisplay(targetIndex, result.damageAmount || 0);
        this.setHitFlag(targetIndex, ENEMY_HIT_ANIMATION_DURATION);
        
        // ダメージ適用
        targetEnemy.takeDamage(result.damageAmount || 0);
        
        // 敵撃破判定
        if (targetEnemy.currentHP <= 0) {
          this.setEnemyDefeatedMessage(targetEnemy.name);
          
          setTimeout(() => {
            const nextAliveIndex = this.findNextAliveEnemyIndex(
              targetIndex,
              this.currentEnemies
            );
            if (nextAliveIndex !== -1) {
              this.setTargetIndex(nextAliveIndex);
            }
          }, 2000);
        }
      } 
      // 全体ターゲットの場合
      else if (skill.targetType === "allEnemies") {
        // 全体攻撃処理...
      }

      // メッセージ表示
      this.setMessage({
        text: result.message,
        sender: "player",
      });
      
      // ステージクリア判定
      this.checkStageCompletion();
    } else {
      this.setMessage({
        text: result.message,
        sender: "system",
      });
    }
  }

  /**
   * バフスキル処理
   */
  private handleBuffSkill(skill: SkillInstance): void {
    // バフスキル処理の実装...
    void skill;
  }

  /**
   * デバフスキル処理
   */
  private handleDebuffSkill(skill: SkillInstance, targetIndex?: number): void {
    // デバフスキル処理の実装...
    void skill;
    void targetIndex;
  }

  /**
   * 特殊スキル処理
   */
  private handleSpecialSkill(skill: SkillInstance, targetIndex?: number): void {
    // 特殊スキル処理の実装...
    void skill;
    void targetIndex;
  }
}