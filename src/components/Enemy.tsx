// src/components/Enemy.tsx
import React from "react";
import { Enemy as EnemyModel } from "../models/EnemyModel";

interface EnemyProps {
  enemy: EnemyModel;  // Enemy クラスのインスタンスをそのまま受け取る
  enemyHit?: boolean;
  playerHit?: boolean;
  playerFire?: boolean;
  enemyDefeated?: boolean;
}

const Enemy: React.FC<EnemyProps> = ({ 
    enemy, 
    enemyHit, 
    playerHit, 
    playerFire, 
    enemyDefeated }) => {
  const hpPercentage = (enemy.currentHP / enemy.maxHP) * 100;
  const baseScale = enemy.scale || 1;
  const effectiveScale = enemyDefeated ? 0 : baseScale;

  // 敵が攻撃するアニメーション
  const enemyClass = `
    ${enemyHit ? "animate-hit" : ""}
    ${playerHit ? "animate-phit" : ""}
    ${playerFire ? "animate-fire" : ""}`;

  return (
    <div className="relative flex flex-col items-center">
        {/* 親要素でscaleを適用 */}
        <div
            className="transition-all duration-1000 ease-out"
            style={{
                transform: `scale(${effectiveScale})`,
                transformOrigin: "bottom",
                opacity: enemyDefeated ? 0 : 1,
            }}>
            {/* 子要素でアニメーションを適用 */}
            <img src={enemy.image} alt={enemy.name} 
            className={`w-24 h-24 object-contain ${enemyClass}`} />
        </div>
        {!enemyDefeated && (
            <div className="w-28 h-3 bg-gray-300 rounded-full mt-1">
                <div
                className="h-full bg-green-500 rounded-full transition-all duration-300"
                style={{ width: `${hpPercentage}%` }}/>
            </div>
        )}
    </div>
    );
};

export default Enemy;
