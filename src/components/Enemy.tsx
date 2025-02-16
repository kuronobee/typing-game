// src/components/Enemy.tsx
import React from "react";
import { EnemyType } from "../data/enemyData";

interface EnemyProps extends EnemyType {
  enemyHit?: boolean;
  enemyDefeated?: boolean;
  // attackProgress プロパティは不要になりました
}

const Enemy: React.FC<EnemyProps> = ({
  name,
  level,
  maxHP,
  currentHP = maxHP,
  image,
  enemyHit,
  enemyDefeated,
  scale,
}) => {
  const hpPercentage = (currentHP / maxHP) * 100;
  const baseScale = scale || 1;
  const effectiveScale = enemyDefeated ? 0 : baseScale;

  return (
    <div className="relative flex flex-col items-center"> 
      {/* 敵画像 */}
      <div
        className={`transition-all duration-1000 ease-out ${enemyHit ? "animate-hit" : ""}`}
        style={{
          transform: `scale(${effectiveScale})`,
          transformOrigin: "bottom",
          opacity: enemyDefeated ? 0 : 1,
        }}
      >
        <img src={image} alt={name} className="w-24 h-24 object-contain" />
      </div>
      {/* HPバー */}
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
