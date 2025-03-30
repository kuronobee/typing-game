// src/managers/StageManager.ts の拡張バージョン

import { Enemy as EnemyModel } from "../models/EnemyModel";
import { stages } from "../data/stages";
import { MessageType } from "../components/MessageDisplay";

/**
 * ステージの管理とステージ関連の機能を提供するクラス
 */
export class StageManager {
  /**
   * ランダムなステージを生成する
   * @returns 生成したステージ情報（敵の配列とメッセージ）
   */
  static createNewStage(): { enemies: EnemyModel[], message: MessageType, scale?: number } {
    // ランダムにステージを選択
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    // 敵インスタンスを生成し、位置情報を設定
    const enemies = stage.enemies.map((enemyData, index) => {
      const enemyInstance = new EnemyModel(enemyData);
      enemyInstance.positionOffset = stage.positions[index] || { x: 0, y: 0 };
      return enemyInstance;
    });
    const scale = stage.scale;
    // 開始メッセージを返す
    const message: MessageType = { 
      text: `問題に正しく回答して敵を倒せ！`, 
      sender: "system" 
    };

    return { enemies, message, scale };
  }

  /**
   * 次の生存している敵を見つける
   * @param startIndex 開始インデックス
   * @param enemies 敵の配列
   * @returns 次の生存している敵のインデックス（見つからなければ-1）
   */
  static findNextAliveEnemyIndex(startIndex: number, enemies: EnemyModel[]): number {
    // 現在のインデックスから後ろ向きに探索
    for (let i = startIndex + 1; i < enemies.length; i++) {
      if (!enemies[i].defeated) {
        return i;
      }
    }
    // 必要に応じて最初から探索
    for (let i = 0; i <= startIndex; i++) {
      if (!enemies[i].defeated) {
        return i;
      }
    }
    return -1; // すべての敵が倒された
  }

  /**
   * ステージが完了したかどうかを確認する（すべての敵が倒されたか）
   * @param enemies 敵の配列
   * @returns すべての敵が倒されたかどうか
   */
  static isStageCompleted(enemies: EnemyModel[]): boolean {
    return enemies.length > 0 && enemies.every((enemy) => enemy.defeated);
  }

  /**
   * ステージの合計経験値を計算する
   * @param enemies 敵の配列
   * @returns 合計経験値
   */
  static calculateTotalExp(enemies: EnemyModel[]): number {
    return enemies.reduce((sum, enemy) => sum + enemy.exp, 0);
  }

  /**
   * ステージ完了メッセージを生成する
   * @param totalExp 獲得経験値
   * @returns メッセージオブジェクト
   */
  static createCompletionMessage(totalExp: number): MessageType {
    return {
      text: `全ての敵を倒した！${totalExp} EXPを獲得しました。Enterキーで次のステージに進む。`,
      sender: "system",
    };
  }

  /**
   * ステージクリア判定と経験値獲得処理を実行
   * @param enemies 敵の配列
   * @param gainEXP 経験値獲得処理関数
   * @param setMessage メッセージ表示関数
   * @param setReadyForNextStage 次のステージ準備関数
   * @returns ステージがクリアされたかどうか
   */
  static handleStageCompletion(
    enemies: EnemyModel[],
    gainEXP: (amount: number) => void,
    setMessage: (message: MessageType) => void,
    setReadyForNextStage: (ready: boolean) => void
  ): boolean {
    // ステージクリア判定
    const isCompleted = this.isStageCompleted(enemies);
    
    if (isCompleted) {
      // 経験値計算
      const totalEXP = this.calculateTotalExp(enemies);
      
      setTimeout(() => {
        // 経験値獲得
        gainEXP(totalEXP);
        
        // クリアメッセージ表示
        setMessage(this.createCompletionMessage(totalEXP));
        
        // 次のステージへの準備
        setReadyForNextStage(true);
      }, 2000);
    }
    
    return isCompleted;
  }
}