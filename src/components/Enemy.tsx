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
    scale, // enemyData.tsで指定した倍率
}) => {
const hpPercentage = (currentHP / maxHP) * 100;
// scale プロパティが指定されていない場合は 1 をデフォルトにする
const baseScale = scale || 1;
// 敵が倒されている場合は、表示倍率を 0 に（縮小＆消去）
const effectiveScale = enemyDefeated ? 0 : baseScale;

return (
    <div className="relative flex flex-col items-center">
      {/* モンスター画像部分のみ、倒された場合は縮小＆フェードアウト、hit アニメーションも適用 */}
      <div
        className={`transition-all duration-1000 ease-out ${enemyHit ? "animate-hit" : ""}`}
        style={{
          transform: `scale(${effectiveScale})`,
          transformOrigin: "bottom", // ここで拡大の基準を画像の下に指定
          opacity: enemyDefeated ? 0 : 1,
        }}
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
