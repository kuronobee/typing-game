// src/managers/ExperienceManager.ts 修正版 - 複数レベルアップ時のスキル獲得修正
import { Player as PlayerModel } from "../models/Player";
import { EXP_GAIN_DISPLAY_DURATION } from "../data/constants";

/**
 * 経験値獲得と表示を管理するクラス
 */
export class ExperienceManager {
  /**
   * 経験値を付与し、表示アニメーションを行う
   * @param amount 獲得経験値
   * @param player プレイヤーインスタンス
   * @param setPlayer Playerステート更新関数
   * @param setExpGain 経験値表示ステート更新関数
   * @param acquireNewSkill 新しいスキルを獲得する関数（オプション）
   */
  static gainExperience(
    amount: number,
    player: PlayerModel,
    setPlayer: React.Dispatch<React.SetStateAction<PlayerModel>>,
    setExpGain: React.Dispatch<React.SetStateAction<number | null>>,
    acquireNewSkill?: (skillId: string) => void
  ): boolean {
    // 獲得経験値を表示する
    setExpGain(amount);
    
    // 表示を一定時間後に消す
    setTimeout(() => setExpGain(null), EXP_GAIN_DISPLAY_DURATION);
    
    // 経験値付与前のレベルを記録
    const oldLevel = player.level;
    
    // 新しいプレイヤーインスタンスを直接計算
    const newPlayer = player.addExp(amount);
    
    // レベルアップしたか確認
    const didLevelUp = newPlayer.level > oldLevel;
    
    // プレイヤー状態を更新
    setPlayer(newPlayer);
    
    // レベルアップした場合のスキル獲得処理
    if (didLevelUp && acquireNewSkill) {
      console.log(`レベルアップ: ${oldLevel} -> ${newPlayer.level}`);
      
      // ここが問題: 複数レベル上がった場合に途中のレベルで獲得するスキルを処理していない
      // 修正: 各レベルごとにスキル獲得処理を行う
      for (let level = oldLevel + 1; level <= newPlayer.level; level++) {
        this.checkAndAcquireSkillsForLevel(level, acquireNewSkill);
      }
    }
    
    return didLevelUp;
  }

  /**
   * 特定レベルで獲得するスキルをチェックして習得する
   * @param level チェックするレベル
   * @param acquireNewSkill スキル獲得関数
   */
  private static checkAndAcquireSkillsForLevel(
    level: number, 
    acquireNewSkill: (skillId: string) => void
  ): void {
    // レベルに応じたスキル獲得判定
    switch (level) {
      case 3:
        console.log(`レベル${level}達成: fire_ballスキル獲得処理`);
        acquireNewSkill('fire_ball');
        break;
      case 5:
        console.log(`レベル${level}達成: fire_stormスキル獲得処理`);
        acquireNewSkill('fire_storm');
        break;
      case 7:
        console.log(`レベル${level}達成: heal_mediumスキル獲得処理`);
        acquireNewSkill('heal_medium');
        break;
      case 10:
        console.log(`レベル${level}達成: heal_majorスキル獲得処理`);
        acquireNewSkill('heal_major');
        break;
      // 必要に応じて他のレベルとスキルを追加
    }
  }

  /**
   * 次のレベルアップに必要な残り経験値を計算する
   * @param player プレイヤーインスタンス
   * @returns 次のレベルまでの残りEXP
   */
  static calculateRemainingExp(player: PlayerModel): number {
    return player.levelUpThreshold - player.exp;
  }

  /**
   * レベルアップによって増加したステータスを計算する
   * @param oldPlayer 以前のプレイヤー状態
   * @param newPlayer 新しいプレイヤー状態
   * @returns 増加したステータス
   */
  static calculateStatIncrease(oldPlayer: PlayerModel, newPlayer: PlayerModel): {
    hp: number;
    mp: number;
    attack: number;
    defense: number;
    magicDefense: number;
    speed: number;
    luck: number;
    power: number;
  } {
    return {
      hp: newPlayer.maxHP - oldPlayer.maxHP,
      mp: newPlayer.maxMP - oldPlayer.maxMP,
      attack: newPlayer.attack - oldPlayer.attack,
      defense: newPlayer.defense - oldPlayer.defense,
      magicDefense: newPlayer.magicDefense - oldPlayer.magicDefense,
      speed: newPlayer.speed - oldPlayer.speed,
      luck: newPlayer.luck - oldPlayer.luck,
      power: newPlayer.power - oldPlayer.power
    };
  }
}