import React from "react";
import { EnemyType } from "../data/enemyData";

interface EnemyProps extends EnemyType {
  enemyHit?: boolean;
  enemyDefeated?: boolean;
}

const Enemy: React.FC<EnemyProps> = ({
  name,
  level,
  maxHP,
  currentHP = maxHP,
  image,
  enemyHit,
  enemyDefeated,
}) => {
  const hpPercentage = (currentHP / maxHP) * 100;

  return (
    <div className="relative flex flex-col items-center">
      {/* モンスター画像部分のみ、倒された場合は縮小＆フェードアウト、hit アニメーションも適用 */}
      <div
        className={`transition-all duration-1000 ease-out ${
          enemyDefeated ? "opacity-0 scale-0" : "opacity-100 scale-100"
        } ${enemyHit ? "animate-hit" : ""}`}
      >
        <img src={image} alt={name} className="w-24 h-24 object-contain" />
      </div>
      {/* HPバー：倒れていない場合のみ表示 */}
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
