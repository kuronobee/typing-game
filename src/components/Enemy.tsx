// src/components/Enemy.tsx
import React from "react";
import { Enemy as EnemyModel } from "../models/EnemyModel";

interface EnemyProps {
  enemy: EnemyModel;  // Enemy クラスのインスタンスをそのまま受け取る
  enemyHit?: boolean;
  enemyDefeated?: boolean;
}

const Enemy: React.FC<EnemyProps> = ({ enemy, enemyHit, enemyDefeated }) => {
  const hpPercentage = (enemy.currentHP / enemy.maxHP) * 100;
  const baseScale = enemy.scale || 1;
  const effectiveScale = enemyDefeated ? 0 : baseScale;

  return (
    <div className="relative flex flex-col items-center">
      <div
        className={`transition-all duration-1000 ease-out ${enemyHit ? "animate-hit" : ""}`}
        style={{
          transform: `scale(${effectiveScale})`,
          transformOrigin: "bottom",
          opacity: enemyDefeated ? 0 : 1,
        }}
      >
        <img src={enemy.image} alt={enemy.name} className="w-24 h-24 object-contain" />
      </div>
      {!enemyDefeated && (
        <div className="w-28 h-3 bg-gray-300 rounded-full mt-1">
          <div
            className="h-full bg-green-500 rounded-full transition-all duration-300"
            style={{ width: `${hpPercentage}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default Enemy;
