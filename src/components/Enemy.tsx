// src/components/Enemy.tsx - 体力ゲージにクラス名を追加

import React from "react";
import { Enemy as EnemyModel } from "../models/EnemyModel";

type DamageDisplay = {
    value: number;
    id: number;
};

interface EnemyProps {
    enemy: EnemyModel;
    enemyHit?: boolean;
    playerHit?: boolean;
    playerFire?: boolean;
    enemyDefeated?: boolean;
    showHealth?: boolean;
    showTargetIndicator?: boolean;
    progress: number;
    damage?: DamageDisplay | null;
    comboCount?: number;
    scaleAdjustment?: number;
}

const Enemy: React.FC<EnemyProps> = ({
    enemy,
    enemyHit,
    playerHit,
    playerFire,
    enemyDefeated,
    showHealth = false,
    showTargetIndicator = false,
    progress,
    damage,
    comboCount,
    scaleAdjustment = 1
}) => {
    const hpPercentage = (enemy.currentHP / enemy.maxHP) * 100;
    const baseScale = enemy.scale || 1;
    const effectiveScale = enemyDefeated ? 0 : (baseScale * scaleAdjustment);
    const enemyClass = `
    ${enemyHit ? "animate-hit" : ""}
    ${playerHit ? "animate-phit" : ""}
    ${playerFire ? "animate-fire" : ""}`;
    const gaugeOffset = 96 * (1 - effectiveScale);
    return (
        <div className="relative inline-block enemy-container">
            {/* 親要素でscaleを適用 */}
            <div
                className="transition-all duration-2000 ease-out"
                style={{
                    transform: `scale(${enemyDefeated ? 0 : effectiveScale})`,
                    transformOrigin: "bottom",
                    opacity: enemyDefeated ? 0 : 1,
                    transition: enemyDefeated ? 'opacity 2s ease-out, transform 2s ease-out' : 'none',
                }}>
                {/* 子要素でアニメーションを適用 */}
                <img
                    src={enemy.image}
                    alt={enemy.name}
                    className={`w-24 h-24 object-contain ${enemyClass}`}
                />
            </div>
            {/* ターゲットインジケーター */}
            {showTargetIndicator && (
                <div
                    className="absolute left-1/2 transform -translate-x-1/2 target-indicator"
                    style={{ top: `${gaugeOffset - 25}px`, opacity: `${enemyDefeated ? 0 : 1}` }}
                />
            )}
            {/* 敵の頭上に小さい攻撃ゲージを表示 */}
            <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-500 rounded attack-gauge"
                style={{ top: `${gaugeOffset - 5}px` }}
            >
                <div
                    className="h-full bg-red-500 rounded"
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                ></div>
            </div>
            {/* showHealth フラグが true の場合のみ表示 - クラス名追加 */}
            {showHealth && !enemyDefeated && (
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-28 h-3 bg-gray-300 rounded-full border-2 border-blue-50 enemy-health-bar">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${hpPercentage}%` }} />
                </div>
            )}
            {/* ダメージ数値の表示 */}
            {damage && (
                <div
                    key={damage.id}
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 text-red-500 font-bold text-2xl animate-damage-fade"
                    style={{ top: "30px" }}>
                    {damage.value}
                </div>
            )}
            {/* コンボ表示: ターゲットかつコンボ数が2以上なら表示 */}
            {damage && comboCount && comboCount > 1 && (
                <div
                    key={comboCount}
                    className={`absolute left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold 
                  ${"text-xl top-[20px]"}
                  animate-combo-fade`}
                >
                    {comboCount}Combo
                </div>
            )}

        </div>
    );
};

export default Enemy;