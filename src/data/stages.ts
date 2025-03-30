// src/data/stages.ts
import enemiesData from "./enemyData";
import { IEnemyData } from "../models/EnemyModel";

export interface Stage {
  id: string;
  enemies: IEnemyData[];
  // 配置情報。各敵ごとに画面上のオフセット（例：x, y座標）を指定する場合
  positions: { x: number; y: number }[];
  scale?: number; // 画面スケール変更
}

export const stages: Stage[] = [
  {
    id: "stage1",
    // ステージ1は、たとえばレベル1～2の敵から選ぶ
    enemies: [
      enemiesData.find(e => e.name === "スライム")!,
      enemiesData.find(e => e.name === "ゴブリン")!,
    ],
    positions: [{ x: -50, y: 0 }, { x: 50, y: 0 }],
    scale: 2,
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "ゴーレム")!,
    ],
    positions: [{ x: 0, y: 0 }],
    scale: 1.5,
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "幽霊剣士")!,
    ],
    positions: [{ x: 0, y: 0 }],
    scale: 2,
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "グリズリー")!,
      enemiesData.find(e => e.name==="グリズリー")!,
    ],
    positions: [{ x: -100, y: 0 }, { x: 100, y: 0 }],
    scale: 1.5,
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "チーター")!,
    ],
    positions: [{ x: 0, y: 0 }],
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "グリズリー")!,
    ],
    positions: [{ x: 0, y: 0 }],
  },
  {
    id: "stage2",
    enemies: [enemiesData.find(e => e.name === "ウォールゴーレム")!],
    positions: [{ x: 0, y: 0 }],
    scale: 0.8,
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "マッドグール")!,
      enemiesData.find(e => e.name === "マッドグール")!,
      enemiesData.find(e => e.name === "マッドグール")!,
    ],
    positions: [{ x: -120, y: 0 },{x: 0, y: 0}, { x: 120, y: 0 }],
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "ギズモ")!,
    ],
    positions: [{ x: 0, y: 60 }],
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "ライノブルート")!,
    ],
    positions: [{ x: 0, y: 0 }],
    scale: 0.5
  },
  

  // 他のステージも追加可能
];
