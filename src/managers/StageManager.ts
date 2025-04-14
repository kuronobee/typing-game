// src/managers/StageManager.ts - モンスターセット対応版

import { Enemy as EnemyModel } from "../models/EnemyModel";
import {
  stages,
  StageProgressionManager,
  Floor,
  MonsterSet,
} from "../data/stages";
import { MessageType } from "../components/MessageDisplay";

/**
 * ステージの管理とステージ関連の機能を提供するクラス
 */
export class StageManager {
  /**
   * ステージIDとフロアインデックスに基づいてステージを生成する
   * @param stageId ステージID
   * @param floorIndex フロアインデックス
   * @returns 生成したステージ情報（敵の配列とメッセージとスケール）
   */
  static createStage(
    stageId: string,
    floorIndex: number
  ): {
    enemies: EnemyModel[];
    message: MessageType;
    scale?: number;
    bg?: string;
    isBossFloor?: boolean;
    monsterSetId?: string; // 選択されたモンスターセットのID
  } {
    // 指定されたステージとフロアを取得
    const floor = StageProgressionManager.getFloor(stageId, floorIndex);

    if (!floor) {
      // 該当するフロアが見つからない場合、デフォルトのステージを返す
      return this.createDefaultStage();
    }

    // モンスターセットをランダムに選択
    let selectedMonsterSet: MonsterSet | null = null;

    // ボスフロアの場合は最初のモンスターセットを使う（通常は1つしかない）
    if (floor.isBossFloor) {
      selectedMonsterSet = floor.monsterSets[0];
    } else {
      // ランダムに選択
      selectedMonsterSet =
        StageProgressionManager.selectRandomMonsterSet(floor);
    }

    if (!selectedMonsterSet) {
      // モンスターセットが見つからない場合、デフォルトのステージを返す
      return this.createDefaultStage();
    }

    // 敵インスタンスを生成し、位置情報を設定
    const enemies = selectedMonsterSet.monsters.map((enemyData, index) => {
      const enemyInstance = new EnemyModel(enemyData);
      enemyInstance.positionOffset = selectedMonsterSet!.positions[index] || {
        x: 0,
        y: 0,
      };

      // ボスフロアなら敵を強化
      if (floor.isBossFloor) {
        // ボス敵の強化（HP1.5倍、攻撃力1.3倍）
        enemyInstance.maxHP = Math.floor(enemyInstance.maxHP * 1.5);
        enemyInstance.currentHP = enemyInstance.maxHP;
        enemyInstance.attackPower = Math.floor(enemyInstance.attackPower * 1.3);

        // 経験値ボーナスがある場合は適用
        if (floor.expBonus) {
          enemyInstance.exp = Math.floor(enemyInstance.exp * floor.expBonus);
        }
      }

      return enemyInstance;
    });

    // 現在のステージ情報を取得
    const currentStage = stages.find((s) => s.id === stageId);

    // フロア情報を含むメッセージを生成
    let messageText = "";
    if (currentStage) {
      const totalFloors = currentStage.floors.length;
      const floorNumber = floorIndex + 1;

      if (floor.isBossFloor) {
        messageText = `【${currentStage.name}】${floor.name} (${floorNumber}/${totalFloors})\n${floor.description}\n⚠️注意: これはボスフロアです！`;
      } else if (selectedMonsterSet.description) {
        // モンスターセットの説明がある場合はそれも表示
        messageText = `【${currentStage.name}】${floor.name} (${floorNumber}/${totalFloors})\n${floor.description}\n${selectedMonsterSet.description}`;
      } else {
        messageText = `【${currentStage.name}】${floor.name} (${floorNumber}/${totalFloors})\n${floor.description}`;
      }
    } else {
      messageText = `${floor.name}\n${floor.description}`;
    }

    const message: MessageType = {
      text: messageText,
      sender: "system",
    };

    return {
      enemies,
      message,
      scale: floor.scale || 1.5,
      bg: floor.bg,
      isBossFloor: floor.isBossFloor,
      monsterSetId: selectedMonsterSet.id,
    };
  }

  /**
   * 新しいステージを生成する（ステージ選択またはフロア進行用）
   * @param stageId 選択されたステージID（省略可）
   * @param floorIndex フロアインデックス（省略可）
   * @returns 生成したステージ情報
   */
  static createNewStage(
    stageId?: string,
    floorIndex?: number
  ): {
    enemies: EnemyModel[];
    message: MessageType;
    scale?: number;
    isBossFloor?: boolean;
    monsterSetId?: string;
  } {
    if (stageId !== undefined && floorIndex !== undefined) {
      // ステージIDとフロアインデックスが両方指定された場合
      return this.createStage(stageId, floorIndex);
    } else if (stageId !== undefined) {
      // ステージIDのみ指定された場合は最初のフロアを使用
      return this.createStage(stageId, 0);
    } else {
      // 進行状況から現在のステージとフロアを取得
      const { stageId: currentStageId, floorIndex: currentFloorIndex } =
        StageProgressionManager.getCurrentProgress();

      return this.createStage(currentStageId, currentFloorIndex);
    }
  }

  /**
   * デフォルトのステージを生成（エラー時のフォールバック）
   */
  private static createDefaultStage(): {
    enemies: EnemyModel[];
    message: MessageType;
    bg?: string;
    scale?: number;
  } {
    // 最初のステージの最初のフロアを使用
    const defaultStage = stages[0];
    const defaultFloor = defaultStage.floors[0];

    // デフォルトのモンスターセット
    const defaultMonsterSet = defaultFloor.monsterSets[0];

    // 敵インスタンスを生成
    const enemies = defaultMonsterSet.monsters.map((enemyData, index) => {
      const enemyInstance = new EnemyModel(enemyData);
      enemyInstance.positionOffset = defaultMonsterSet.positions[index] || {
        x: 0,
        y: 0,
      };
      return enemyInstance;
    });

    // エラーメッセージを含めた通知
    const message: MessageType = {
      text: `指定されたステージが見つかりませんでした。デフォルトステージを表示します。\n${defaultFloor.description}`,
      sender: "system",
    };

    return { enemies, message, scale: defaultFloor.scale };
  }

  /**
   * 次の生存している敵を見つける
   * @param startIndex 開始インデックス
   * @param enemies 敵の配列
   * @returns 次の生存している敵のインデックス（見つからなければ-1）
   */
  static findNextAliveEnemyIndex(
    startIndex: number,
    enemies: EnemyModel[]
  ): number {
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
   * 次のフロアへ進む
   * 現在の進行状況を更新し、次のフロア情報を返す
   */
  static advanceToNextFloor(): {
    stageId: string;
    floorIndex: number;
    isNewStage: boolean;
  } {
    const { stageId: currentStageId, floorIndex: currentFloorIndex } =
      StageProgressionManager.getCurrentProgress();

    const { stageId: nextStageId, floorIndex: nextFloorIndex } =
      StageProgressionManager.advanceToNextFloor(
        currentStageId,
        currentFloorIndex
      );

    // 新しいステージに移動したかどうかを判定
    const isNewStage = nextStageId !== currentStageId;

    return { stageId: nextStageId, floorIndex: nextFloorIndex, isNewStage };
  }

  /**
   * ステージ完了メッセージを生成する
   * @param totalExp 獲得経験値
   * @param isBossFloor ボスフロアかどうか
   * @returns メッセージオブジェクト
   */
  static createCompletionMessage(
    totalExp: number,
    isBossFloor?: boolean
  ): MessageType {
    if (isBossFloor) {
      return {
        text: `ボスを倒した！${totalExp} EXPを獲得しました。次のフロアに進むか、同じフロアを再挑戦できます。`,
        sender: "system",
      };
    }
    return {
      text: `全ての敵を倒した！${totalExp} EXPを獲得しました。次のフロアに進むか、同じフロアを再挑戦できます。`,
      sender: "system",
    };
  }

  /**
   * ステージクリア判定と経験値獲得処理を実行
   * @param enemies 敵の配列
   * @param gainEXP 経験値獲得処理関数
   * @param setMessage メッセージ表示関数
   * @param setReadyForNextStage 次のステージ準備関数
   * @param isBossFloor ボスフロアかどうか
   * @returns ステージがクリアされたかどうか
   */
  static handleStageCompletion(
    enemies: EnemyModel[],
    gainEXP: (amount: number) => void,
    setMessage: (message: MessageType) => void,
    setReadyForNextStage: (ready: boolean) => void,
    setStageScale?: (scale: number) => void,
    isBossFloor?: boolean,
    stageId?: string,
    floorIndex?: number
  ): boolean {
    // ステージクリア判定
    const isCompleted = this.isStageCompleted(enemies);
    console.log("Enemy defeated:", enemies);
    console.log("isCompleted", isCompleted);
    console.log("stageId", stageId);
    console.log("floorIndex", floorIndex);

    if (isCompleted) {
      // 経験値計算
      const totalEXP = this.calculateTotalExp(enemies);

      // 現在のステージIDとフロアインデックスを保存
      const { stageId: currentStageId, floorIndex: currentFloorIndex } =
        StageProgressionManager.getCurrentProgress();

      // クリア回数をインクリメント - stageIdとfloorIndexが指定されていればそれを使用
      StageProgressionManager.incrementFloorCompletionCount(
        stageId || currentStageId,
        floorIndex !== undefined ? floorIndex : currentFloorIndex
      );

      setTimeout(() => {
        // 経験値獲得
        gainEXP(totalEXP);

        // クリアメッセージ表示
        setMessage(this.createCompletionMessage(totalEXP, isBossFloor));

        // 次のステージへの準備
        setReadyForNextStage(true);

        // スケールをデフォルト値（2）に戻す
        if (setStageScale) {
          setStageScale(2);
        }
      }, 2000);
    }

    return isCompleted;
  }
}
