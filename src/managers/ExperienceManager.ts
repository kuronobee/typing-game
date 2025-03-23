// src/managers/ExperienceManager.ts 完全修正版
import { Player as PlayerModel } from "../models/Player";
import { EXP_GAIN_DISPLAY_DURATION } from "../data/constants";

// 各レベルで習得するスキル情報を一元管理
interface LevelSkill {
  level: number;
  skillId: string;
  skillName: string;
}

/**
 * 経験値獲得と表示を管理するクラス
 */
export class ExperienceManager {
  // レベルごとのスキル定義
  static readonly LEVEL_SKILLS: LevelSkill[] = [
    { level: 3, skillId: 'fire_ball', skillName: 'ファイアボール' },
    { level: 5, skillId: 'fire_storm', skillName: 'ファイアストーム' },
    { level: 7, skillId: 'heal_medium', skillName: '中回復' },
    { level: 10, skillId: 'heal_major', skillName: '大回復' },
    // 必要に応じて追加
  ];

  /**
   * 経験値を付与し、表示アニメーションを行う
   * @param amount 獲得経験値
   * @param player プレイヤーインスタンス
   * @param setPlayer Playerステート更新関数
   * @param setExpGain 経験値表示ステート更新関数
   * @param acquireNewSkill 新しいスキルを獲得する関数
   * @param showLevelUp レベルアップ表示関数
   */
  static gainExperience(
    amount: number,
    player: PlayerModel,
    setPlayer: React.Dispatch<React.SetStateAction<PlayerModel>>,
    setExpGain: React.Dispatch<React.SetStateAction<number | null>>,
    acquireNewSkill?: (skillId: string) => void,
    showLevelUp?: (level: number, callback: () => void) => void
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
    
    // まずプレイヤー状態を更新（レベルアップ画面でステータスを確認できるように）
    setPlayer(newPlayer);
    
    // レベルアップした場合の処理
    if (didLevelUp && showLevelUp) {
      console.log(`レベルアップ: ${oldLevel} -> ${newPlayer.level}`);
      
      // 順番に各レベルを表示するための関数
      this.processLevelUpsSequentially(
        oldLevel + 1,
        newPlayer.level,
        showLevelUp,
        acquireNewSkill
      );
      
      return true;
    }
    
    return didLevelUp;
  }

  /**
   * 順番に各レベルアップ処理と表示を行う
   * @param startLevel 開始レベル
   * @param endLevel 終了レベル
   * @param showLevelUp レベルアップ表示関数
   * @param acquireNewSkill スキル獲得関数
   * @param currentIndex 現在処理中のインデックス（再帰用）
   */
  private static processLevelUpsSequentially(
    startLevel: number,
    endLevel: number,
    showLevelUp: (level: number, callback: () => void) => void,
    acquireNewSkill?: (skillId: string) => void,
    currentIndex: number = 0
  ): void {
    // 処理するレベルがなくなったら終了
    if (startLevel + currentIndex > endLevel) {
      return;
    }

    // 現在のレベル
    const currentLevel = startLevel + currentIndex;
    
    // このレベルに関連するスキルを取得
    const skillsForThisLevel = this.getSkillsForLevel(currentLevel);
    
    // レベルアップ画面を表示（閉じた後のコールバックも含む）
    showLevelUp(currentLevel, () => {
      // 各スキルを獲得
      if (acquireNewSkill) {
        skillsForThisLevel.forEach(skill => {
          console.log(`レベル${currentLevel}達成: ${skill.skillName}(${skill.skillId})スキル獲得処理`);
          acquireNewSkill(skill.skillId);
        });
      }
      
      // 次のレベルを処理
      this.processLevelUpsSequentially(
        startLevel,
        endLevel,
        showLevelUp,
        acquireNewSkill,
        currentIndex + 1
      );
    });
  }

  /**
   * 特定レベルで獲得するスキルを取得
   * @param level チェックするレベル
   * @returns そのレベルで獲得するスキル情報の配列
   */
  private static getSkillsForLevel(level: number): LevelSkill[] {
    return this.LEVEL_SKILLS.filter(skill => skill.level === level);
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