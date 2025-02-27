// src/utils/GameLogic.ts
import { IEnemyData } from "../models/EnemyModel";

// ダメージ計算関数（最低ダメージは 1）
export function calculateDamage(attackPower: number, enemy: IEnemyData): number {
  const baseDamage = attackPower - Math.floor(enemy.defense / 2);
  return baseDamage > 0 ? baseDamage : 1;
}

// ファイアダメージ計算関数
export function calculateFireDamage(
  maxDamage: number,
  magicDefense: number
): number {
  const baseDamage = maxDamage * Math.exp(-magicDefense / 100);

  // ランダム要素: ±10% の範囲で変動
  const randomFactor = 0.9 + Math.random() * 0.2; // 0.9 〜 1.1 のランダム値
  const finalDamage = baseDamage * randomFactor;

  return Math.max(1, Math.round(finalDamage)); // 最小1ダメージ保証
}

