// src/components/Enemy.tsx
import React from "react";
import { Enemy as EnemyModel } from "../models/EnemyModel";

interface EnemyProps {
    enemy: EnemyModel;  // Enemy クラスのインスタンスをそのまま受け取る
    enemyHit?: boolean;
    playerHit?: boolean;
    playerFire?: boolean;
    enemyDefeated?: boolean;
    showHealth?: boolean; // 体力ゲージ表示用フラグ
    showTargetIndicator?: boolean; // ターゲット指定用フラグ
    progress: number; // 攻撃ゲージの進捗
}

const Enemy: React.FC<EnemyProps> = ({
    enemy,
    enemyHit,
    playerHit,
    playerFire,
    enemyDefeated,
    showHealth = false,
    showTargetIndicator = false,
    progress, }) => {
    const hpPercentage = (enemy.currentHP / enemy.maxHP) * 100;
    const baseScale = enemy.scale || 1;
    const effectiveScale = enemyDefeated ? 0 : baseScale;
    // 敵が攻撃するアニメーション
    const enemyClass = `
    ${enemyHit ? "animate-hit" : ""}
    ${playerHit ? "animate-phit" : ""}
    ${playerFire ? "animate-fire" : ""}`;
    
    const gaugeOffset = 96 * (1 - effectiveScale);
    return (
        <div className="relative inline-block">
            {/* 親要素でscaleを適用 */}
            <div
                className="transition-all duration-1000 ease-out"
                style={{
                    transform: `scale(${effectiveScale})`,
                    transformOrigin: "bottom",
                    opacity: enemyDefeated ? 0 : 1,
                }}>
                {/* 子要素でアニメーションを適用 */}
                <img
                    src={enemy.image}
                    alt={enemy.name}
                    className={`w-24 h-24 object-contain ${enemyClass}`}
                />
            </div>
            {/* ターゲットインジケーター（3D横回転） */}
            {/* ターゲットインジケーター：固定サイズ、画像スケールに左右されずに敵の頭上に配置 */}
            {showTargetIndicator && (
                <div
                    className="absolute left-1/2 transform -translate-x-1/2 target-indicator"
                    style={{ top: `${gaugeOffset - 25}px` }}
                />
            )}
            {/* 敵の頭上に小さい攻撃ゲージを表示 */}
            <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-500 rounded"
                style={{ top: `${gaugeOffset - 5}px` }}
            >
                <div
                    className="h-full bg-red-500 rounded"
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                ></div>
            </div>
            {/* showHealth フラグが true の場合のみ表示 */}
            {showHealth && !enemyDefeated && (
                <div className="absolute bottom-[-10px] left-1/2 transform -translate-x-1/2 w-28 h-3 bg-gray-300 rounded-full border-2 border-blue-50">
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${hpPercentage}%` }} />
                </div>
            )}
        </div>
    );
};

export default Enemy;
