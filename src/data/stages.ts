// src/data/stages.ts - モンスターセットとエンカウント率システム導入

import enemiesData from "./enemyData";
import { IEnemyData } from "../models/EnemyModel";

// モンスターグループを定義する型
export interface MonsterSet {
  id: string; // モンスターセットの一意識別子
  monsters: IEnemyData[]; // このセットに含まれるモンスター
  positions: { x: number; y: number }[]; // モンスターの配置情報
  encounterRate: number; // エンカウント率 (0.0〜1.0の値、合計で1.0になるようにする)
  description?: string; // モンスターセットの説明（任意）
}

// フロア情報の定義
export interface Floor {
  id: string;
  name: string; // フロア名
  bg?: string; // 背景画像のURL
  monsterSets: MonsterSet[]; // このフロアに登場する可能性のあるモンスターセット
  scale?: number; // 表示スケール
  isBossFloor?: boolean; // ボスフロアかどうか
  description: string; // フロアの説明
  expBonus?: number; // 経験値ボーナス（通常の1.0倍に対する倍率）
}

// ステージ情報の定義
export interface Stage {
  id: string;
  name: string; // ステージ名称
  difficulty: string; // 難易度表記
  backgroundClass: string; // 背景スタイルクラス
  description: string; // ステージの説明
  floors: Floor[]; // このステージのフロア一覧
  unlocked: boolean; // 解放済みかどうか
}

// ゲーム全体のステージデータ
export const stages: Stage[] = [
  {
    id: "wildlands",
    name: "荒野",
    difficulty: "英検2級",
    backgroundClass: "../assets/bg/wildland.png",
    description: "広大な荒野を舞台にした冒険。敵は素早く、攻撃力が高いため注意が必要です。",
    unlocked: true, // 最初から解放
    floors: [
      {
        id: "wildlands_1",
        name: "草原地帯",
        monsterSets: [
          {
            id: "slime_pair",
            monsters: [
              enemiesData.find(e => e.name === "スライム")!,
              enemiesData.find(e => e.name === "スライム")!
            ],
            positions: [{ x: -80, y: 0 }, { x: 80, y: 0 }],
            encounterRate: 0.6, // 60%の確率で出現
            description: "2体のスライムが出現する一般的なパターン"
          },
          {
            id: "goblin_solo",
            monsters: [
              enemiesData.find(e => e.name === "ゴブリン")!
            ],
            positions: [{ x: 0, y: 0 }],
            encounterRate: 0.3, // 30%の確率で出現
            description: "1体のゴブリンが単独で出現する珍しいパターン"
          },
          {
            id: "rare_grizzly",
            monsters: [
              enemiesData.find(e => e.name === "グリズリー")!
            ],
            positions: [{ x: 0, y: 0 }],
            encounterRate: 0.1, // 10%の確率で出現
            description: "まれに出現する強敵グリズリー。このフロアでは特に危険"
          }
        ],
        scale: 1.5,
        description: "広大な草原地帯。弱い敵が多く出現します。時々、強敵に遭遇することも。"
      },
      {
        id: "wildlands_2",
        name: "岩場",
        bg: new URL("../assets/bg/wildland2.png", import.meta.url).toString(),
        monsterSets: [
          {
            id: "goblin_slime",
            monsters: [
              enemiesData.find(e => e.name === "ゴブリン")!,
              enemiesData.find(e => e.name === "スライム")!
            ],
            positions: [{ x: -70, y: 0 }, { x: 70, y: 0 }],
            encounterRate: 0.7, // 70%の確率で出現
            description: "ゴブリンとスライムの組み合わせ。最も一般的なパターン"
          },
          {
            id: "multi_goblin",
            monsters: [
              enemiesData.find(e => e.name === "ゴブリン")!,
              enemiesData.find(e => e.name === "ゴブリン")!,
              enemiesData.find(e => e.name === "ゴブリン")!
            ],
            positions: [{ x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 }],
            encounterRate: 0.3, // 30%の確率で出現
            description: "3体のゴブリンが一度に現れる厄介なパターン"
          }
        ],
        scale: 1.5,
        description: "険しい岩場。ゴブリンが現れるようになります。"
      },
      {
        id: "wildlands_3",
        name: "切り立った崖",
        bg: new URL("../assets/bg/wildland3.jpg", import.meta.url).toString(),
        monsterSets: [
          {
            id: "goblin_pair_slime",
            monsters: [
              enemiesData.find(e => e.name === "ゴブリン")!,
              enemiesData.find(e => e.name === "ゴブリン")!,
              enemiesData.find(e => e.name === "スライム")!
            ],
            positions: [{ x: -100, y: 0 }, { x: 0, y: 0 }, { x: 100, y: 0 }],
            encounterRate: 0.5, // 50%の確率で出現
            description: "2体のゴブリンと1体のスライムの組み合わせ"
          },
          {
            id: "grizzly_slime",
            monsters: [
              enemiesData.find(e => e.name === "グリズリー")!,
              enemiesData.find(e => e.name === "スライム")!
            ],
            positions: [{ x: -80, y: 0 }, { x: 80, y: 0 }],
            encounterRate: 0.4, // 40%の確率で出現
            description: "グリズリーとスライムの組み合わせ。危険度が高い"
          },
          {
            id: "rare_golem",
            monsters: [
              enemiesData.find(e => e.name === "ゴーレム")!
            ],
            positions: [{ x: 0, y: 0 }],
            encounterRate: 0.1, // 10%の確率で出現
            description: "まれに出現する非常に強力なゴーレム。このフロアでは特に警戒が必要"
          }
        ],
        scale: 1.4,
        description: "崖に囲まれた狭い通路。複数の敵が待ち構えています。"
      },
      {
        id: "wildlands_4",
        name: "獣の巣",
        bg: new URL("../assets/bg/wildland4.jpg", import.meta.url).toString(),
        monsterSets: [
          {
            id: "boss_grizzly",
            monsters: [
              enemiesData.find(e => e.name === "グリズリー")!
            ],
            positions: [{ x: 0, y: 0 }],
            encounterRate: 1.0, // ボスは100%の確率で出現
            description: "この荒野を支配する強大な獣。ボス戦となる"
          }
        ],
        scale: 1.3,
        isBossFloor: true,
        expBonus: 1.5, // ボスフロアなので経験値1.5倍
        description: "この荒野を支配する強大な獣の巣。ボスとの戦いに備えよう！"
      }
    ]
  },
  {
    id: "cave",
    name: "洞窟",
    difficulty: "英検2級",
    backgroundClass: "cave-bg",
    description: "洞窟の奥深くに潜む強敵と戦います。防御力が高く、特殊な攻撃にも備えましょう。",
    unlocked: true, // 最初から解放
    floors: [
      {
        id: "cave_1",
        name: "洞窟入口",
        monsterSets: [
          {
            id: "bat_pair",
            monsters: [
              enemiesData.find(e => e.name === "コウモリ") || enemiesData.find(e => e.name === "スライム")!,
              enemiesData.find(e => e.name === "コウモリ") || enemiesData.find(e => e.name === "スライム")!
            ],
            positions: [{ x: -70, y: 0 }, { x: 70, y: 0 }],
            encounterRate: 0.8, // 80%の確率で出現
            description: "2体のコウモリの組み合わせ。最も一般的"
          },
          {
            id: "rare_ghoul",
            monsters: [
              enemiesData.find(e => e.name === "マッドグール")!
            ],
            positions: [{ x: 0, y: 0 }],
            encounterRate: 0.2, // 20%の確率で出現
            description: "まれに出現する強敵。この階層では特に危険"
          }
        ],
        scale: 1.2,
        description: "洞窟の入口付近。まだ明るく、比較的弱い敵が出現します。"
      },
      {
        id: "cave_2",
        name: "鍾乳洞",
        monsterSets: [
          {
            id: "single_ghoul",
            monsters: [
              enemiesData.find(e => e.name === "マッドグール")!
            ],
            positions: [{ x: 0, y: 0 }],
            encounterRate: 0.6, // 60%の確率で出現
            description: "1体のマッドグール。一般的なパターン"
          },
          {
            id: "bat_ghoul",
            monsters: [
              enemiesData.find(e => e.name === "コウモリ") || enemiesData.find(e => e.name === "スライム")!,
              enemiesData.find(e => e.name === "マッドグール")!
            ],
            positions: [{ x: -80, y: 0 }, { x: 80, y: 0 }],
            encounterRate: 0.4, // 40%の確率で出現
            description: "コウモリとマッドグールの組み合わせ。対処が難しい"
          }
        ],
        scale: 1.2,
        description: "美しい鍾乳石が垂れ下がる洞窟。しかし危険な敵が潜んでいます。"
      },
      {
        id: "cave_3",
        name: "地下水脈",
        monsterSets: [
          {
            id: "dual_ghoul",
            monsters: [
              enemiesData.find(e => e.name === "マッドグール")!,
              enemiesData.find(e => e.name === "マッドグール")!
            ],
            positions: [{ x: -80, y: 0 }, { x: 80, y: 0 }],
            encounterRate: 0.6, // 60%の確率で出現
            description: "2体のマッドグール。最も一般的なパターン"
          },
          {
            id: "rare_mini_golem",
            monsters: [
              enemiesData.find(e => e.name === "ゴーレム")!,
              enemiesData.find(e => e.name === "マッドグール")!
            ],
            positions: [{ x: -100, y: 0 }, { x: 100, y: 0 }],
            encounterRate: 0.3, // 30%の確率で出現
            description: "ゴーレムとマッドグールの組み合わせ。ボス戦の前触れ"
          },
          {
            id: "very_rare_triple",
            monsters: [
              enemiesData.find(e => e.name === "マッドグール")!,
              enemiesData.find(e => e.name === "マッドグール")!,
              enemiesData.find(e => e.name === "マッドグール")!
            ],
            positions: [{ x: -120, y: 0 }, { x: 0, y: 0 }, { x: 120, y: 0 }],
            encounterRate: 0.1, // 10%の確率で出現
            description: "3体のマッドグールが一度に現れる非常に稀なパターン。最高難度"
          }
        ],
        scale: 1.2,
        description: "地下水が流れる湿った通路。多くの敵が待ち構えています。"
      },
      {
        id: "cave_4",
        name: "深淵の間",
        monsterSets: [
          {
            id: "boss_golem",
            monsters: [
              enemiesData.find(e => e.name === "ゴーレム")!
            ],
            positions: [{ x: 0, y: -30 }],
            encounterRate: 1.0, // ボスは100%の確率で出現
            description: "洞窟の主であるゴーレム。強力な一撃に注意"
          }
        ],
        scale: 1.0, // ボス戦なので少し引きで表示
        isBossFloor: true,
        expBonus: 1.8, // ボスフロアなので経験値1.8倍
        description: "洞窟の最深部に広がる広大な空間。ここに洞窟の主が待ち構えています！"
      }
    ]
  }
];

// プレーヤーの現在の進行状況を管理するクラス
export class StageProgressionManager {
  // 現在のステージとフロアの保存用キー
  private static readonly STORAGE_KEY = 'game_progression';

  // 現在のステージとフロアのインデックスを取得
  static getCurrentProgress(): { stageId: string; floorIndex: number } {
    try {
      const savedData = localStorage.getItem(this.STORAGE_KEY);
      if (savedData) {
        return JSON.parse(savedData);
      }
    } catch (error) {
      console.error('進行状況の取得に失敗しました', error);
    }

    // 初期値：最初のステージの最初のフロア
    return { stageId: stages[0].id, floorIndex: 0 };
  }

  // 進行状況を保存
  static saveProgress(stageId: string, floorIndex: number): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ stageId, floorIndex }));
    } catch (error) {
      console.error('進行状況の保存に失敗しました', error);
    }
  }

  // 次のフロアへ進む（同じステージ内）
  static advanceToNextFloor(currentStageId: string, currentFloorIndex: number): { stageId: string; floorIndex: number } {
    const currentStage = stages.find(s => s.id === currentStageId);
    if (!currentStage) {
      return { stageId: currentStageId, floorIndex: currentFloorIndex };
    }

    // 次のフロアがあるかチェック
    if (currentFloorIndex < currentStage.floors.length - 1) {
      const nextFloorIndex = currentFloorIndex + 1;
      this.saveProgress(currentStageId, nextFloorIndex);
      return { stageId: currentStageId, floorIndex: nextFloorIndex };
    }

    // 次のステージがあるかチェック
    const currentStageIndex = stages.findIndex(s => s.id === currentStageId);
    if (currentStageIndex < stages.length - 1) {
      const nextStageId = stages[currentStageIndex + 1].id;
      this.saveProgress(nextStageId, 0);
      return { stageId: nextStageId, floorIndex: 0 };
    }

    // 全てのステージをクリアした場合は現在の位置を返す
    return { stageId: currentStageId, floorIndex: currentFloorIndex };
  }

  // 特定のステージとフロアを取得
  static getFloor(stageId: string, floorIndex: number): Floor | null {
    const stage = stages.find(s => s.id === stageId);
    if (!stage || floorIndex < 0 || floorIndex >= stage.floors.length) {
      return null;
    }
    return stage.floors[floorIndex];
  }

  // 特定のフロアからモンスターセットをランダムに選択
  static selectRandomMonsterSet(floor: Floor): MonsterSet | null {
    if (!floor || !floor.monsterSets || floor.monsterSets.length === 0) {
      return null;
    }

    // エンカウント率の合計が1.0になっていることを確認
    const totalRate = floor.monsterSets.reduce((sum, set) => sum + set.encounterRate, 0);
    
    // ほぼ1.0に近い場合は正規化せずそのまま使用
    if (Math.abs(totalRate - 1.0) > 0.01) {
      console.warn(`フロア ${floor.id} のエンカウント率合計が1.0ではありません (${totalRate})`);
      // 必要に応じて正規化することも可能
    }

    // 乱数を生成 (0.0〜1.0)
    const rand = Math.random();
    
    // 乱数に基づいてモンスターセットを選択
    let cumulativeRate = 0;
    for (const monsterSet of floor.monsterSets) {
      cumulativeRate += monsterSet.encounterRate;
      if (rand <= cumulativeRate) {
        return monsterSet;
      }
    }

    // 万が一どのセットも選択されなかった場合は最後のセットを返す
    return floor.monsterSets[floor.monsterSets.length - 1];
  }

  // 現在のフロアを取得
  static getCurrentFloor(): Floor | null {
    const { stageId, floorIndex } = this.getCurrentProgress();
    return this.getFloor(stageId, floorIndex);
  }

  // ステージ内の総フロア数を取得
  static getTotalFloorsInStage(stageId: string): number {
    const stage = stages.find(s => s.id === stageId);
    return stage ? stage.floors.length : 0;
  }

  // 現在のステージを取得
  static getCurrentStage(): Stage | null {
    const { stageId } = this.getCurrentProgress();
    return stages.find(s => s.id === stageId) || null;
  }
}