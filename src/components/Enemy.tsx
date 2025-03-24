// src/components/Enemy.tsx を修正

import React, {useEffect, useState} from "react";
import { Enemy as EnemyModel } from "../models/EnemyModel";
import MonsterMessage from "./MonsterMessage";

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
    specialAttackType?: string | null;
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
    scaleAdjustment = 1,
    specialAttackType = null,
}) => {
    const hpPercentage = (enemy.currentHP / enemy.maxHP) * 100;
    const baseScale = enemy.scale || 1;
    const effectiveScale = enemyDefeated ? 0 : (baseScale * scaleAdjustment);
    const enemyClass = `
    ${enemyHit ? "animate-hit" : ""}
    ${playerHit ? "animate-phit" : ""}
    ${playerFire ? "animate-fire" : ""}`;
    const gaugeOffset = 96 * (1 - effectiveScale);

    // 攻撃ゲージの警告閾値 (80%で警告開始)
    const warningThreshold = 0.8;
    const criticalThreshold = 0.95; // 95%で危険警告

    // 攻撃ゲージのクラス判定
    let attackGaugeClass = "";
    let attackBarClass = "bg-red-500";

    if (progress >= criticalThreshold) {
        // 95%以上：危険警告
        attackGaugeClass = "attack-gauge-warning attack-gauge-critical";
        attackBarClass = "bg-red-500 animate-attack-ready-flash";
    } else if (progress >= warningThreshold) {
        // 80%以上：通常警告
        attackGaugeClass = "attack-gauge-warning";
        attackBarClass = "bg-red-500 animate-attack-warning";
    }
    const [showMessage, setShowMessage] = useState<string | null>(null);
    // プレイヤーが攻撃を受けたときに特別メッセージを表示する
    useEffect(() => {
        if (playerHit) {
            setShowMessage(`${enemy.name}の攻撃！`);
            console.log(`${enemy.name}の攻撃！`);
            // 一定時間後にメッセージを消す
            setTimeout(() => {
                setShowMessage(null);
            }, 1000);
            
            //return () => clearTimeout(timer);
        }
    }, [playerHit, enemy.name]);
    useEffect(() => {
        if (specialAttackType) {
            setShowMessage(specialAttackType);
            console.log(specialAttackType);
            setTimeout(() => {
                setShowMessage(null);
            }, 1000);
        }
    }, [specialAttackType]);
    return (
        <div className="relative inline-block enemy-container">
            {/* 特殊攻撃メッセージ表示 */}
            {showMessage && (
                <MonsterMessage 
                    message={showMessage} 
                    position="top"
                />
            )}
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
                    style={{ top: `${gaugeOffset - 30}px`, opacity: `${enemyDefeated ? 0 : 1}` }}
                />
            )}
            {/* showHealth フラグが true の場合のみ表示 - クラス名追加 */}
            {showHealth && !enemyDefeated && (
                <div className="absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-28 h-3 bg-gray-300 rounded-full border-2 border-blue-50 enemy-health-bar"
                    style={{ top: `${gaugeOffset - 7}px` }}>
                    <div
                        className="h-full bg-green-500 rounded-full transition-all duration-300"
                        style={{ width: `${hpPercentage}%` }} />
                </div>
            )}
            {/* 敵の頭上に小さい攻撃ゲージを表示 - 警告クラスを追加 */}
            <div
                className={`absolute top-[-12px] left-1/2 transform -translate-x-1/2 w-16 h-1 bg-gray-500 rounded attack-gauge ${attackGaugeClass}`}
                style={{ top: `${gaugeOffset - 12}px` }}
            >
                <div
                    className={`h-full ${attackBarClass} rounded`}
                    style={{ width: `${Math.min(progress * 100, 100)}%` }}
                ></div>
            </div>

            {/* 危険警告アイコンを表示（95%以上の場合） */}
            {progress >= criticalThreshold && !enemyDefeated && (
                <div
                    className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 text-red-500 animate-pulse"
                    style={{ top: `${gaugeOffset - 20}px` }}
                >
                    ⚠️
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