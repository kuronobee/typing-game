import { EnemyType } from "../data/enemyData";

// ダメージ計算関数（最低ダメージは 1）
export function calculateDamage(attackPower: number, enemy: EnemyType): number {
  const baseDamage = attackPower - Math.floor(enemy.defense / 2);
  return baseDamage > 0 ? baseDamage : 1;
}
// ヒント生成関数（Unicode THIN SPACE を使用）
const getHint = (answer: string, wrongAttempts: number): string => {
    const n = answer.length;
    const hintArray = answer.split('').map(ch => (ch === ' ' ? ' ' : '_'));
    let nonSpaceIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (answer[i] !== ' ') {
        nonSpaceIndices.push(i);
      }
    }
    let orderList: number[] = [];
    if (nonSpaceIndices.length > 1) {
      orderList.push(nonSpaceIndices[1]);
    }
    if (nonSpaceIndices.length > 3) {
      orderList.push(nonSpaceIndices[3]);
    }
    for (let idx of nonSpaceIndices) {
      if (!orderList.includes(idx)) {
        orderList.push(idx);
      }
    }
    const reveals = Math.min(wrongAttempts, orderList.length);
    for (let i = 0; i < reveals; i++) {
      const idx = orderList[i];
      hintArray[idx] = answer[idx];
    }
    // Unicode THIN SPACE (U+2009) を区切り文字として使用
    return hintArray.join('\u2009');
  };
    