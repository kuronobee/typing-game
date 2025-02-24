// src/data/stages.ts
import enemiesData, { EnemyType } from "./enemyData";

export interface Stage {
  id: string;
  enemies: EnemyType[];
  // 配置情報。各敵ごとに画面上のオフセット（例：x, y座標）を指定する場合
  positions: { x: number; y: number }[];
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
  },
  {
    id: "stage2",
    enemies: [
      enemiesData.find(e => e.name === "グレートオーガ")!,
      enemiesData.find(e => e.name === "ゴーレム")!,
      enemiesData.find(e => e.name === "ドラゴン")!,
    ],
    positions: [{ x: -150, y: -10 }, { x: 0, y: 0 }, { x: 150, y: -10 }],
  },
  // 他のステージも追加可能
];
