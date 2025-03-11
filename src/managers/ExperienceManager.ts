// src/managers/ExperienceManager.ts 修正版
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
   * @param setShowLevelUp レベルアップ表示ステート更新関数
   */
  static gainExperience(
    amount: number,
    player: PlayerModel,
    setPlayer: React.Dispatch<React.SetStateAction<PlayerModel>>,
    setExpGain: React.Dispatch<React.SetStateAction<number | null>>,
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
    
    // レベルアップした場合は通知を表示
    if (didLevelUp) {
      console.log(`レベルアップ検出: ${oldLevel} -> ${newPlayer.level}`);
    }
    return didLevelUp;
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