// src/components/LevelUpNotifier.tsx の修正

import React, { useEffect, useRef, useState } from "react";
import { Player as PlayerModel } from "../models/Player";
import { ExperienceManager } from "../managers/ExperienceManager";

interface LevelUpNotifierProps {
    player: PlayerModel;
    level: number; // 表示するレベル
    onClose: () => void;
}

const LevelUpNotifier: React.FC<LevelUpNotifierProps> = ({ player, level, onClose }) => {
    // 前回のプレイヤー状態を一時的に保存する ref
    const prevPlayerRef = useRef<PlayerModel | null>(null);

    // エラー状態を追跡
    const [hasError, setHasError] = useState(false);

    // このレベルで習得するスキル情報
    const skillsForLevel = ExperienceManager.LEVEL_SKILLS
        .filter(skill => skill.level === level)
        .map(skill => skill.skillName);

    console.log(`レベル${level}での習得スキル:`, skillsForLevel);

    // コンポーネントマウント時に一度だけprevPlayerを設定
    useEffect(() => {
        try {
            // レベル整合性チェック
            if (level > player.level) {
                console.error(`異常なレベル: 表示レベル ${level} が現在レベル ${player.level} より大きい`);
                setHasError(true);
                return;
            }

            if (level <= 0) {
                console.error(`不正なレベル値: ${level}`);
                setHasError(true);
                return;
            }

            // prevPlayerにはレベルアップ前の状態を推測して設定
            if (!prevPlayerRef.current) {
                // 現在のプレイヤーからレベルが1つ低い状態を作成
                const prevLevel = level - 1;

                // 前のレベルのステータスを推測（レベルごとの増加量に基づく）
                const estimatedPrevHp = Math.max(player.maxHP - 10, 10);
                const estimatedPrevMp = Math.max(player.maxMP - 5, 5);
                const estimatedPrevDefense = Math.max(player.defense - 1, 1);
                const estimatedPrevMagicDefense = Math.max(player.magicDefense - 1, 1);
                const estimatedPrevSpeed = Math.max(player.speed - 1, 1);
                const estimatedPrevAttack = Math.max(player.attack - 2, 1);
                const estimatedPrevLuck = Math.max(player.luck - 1, 1);
                const estimatedPrevPower = Math.max(player.power - 1, 1);

                // レベルアップ前の状態を推測して設定
                prevPlayerRef.current = new PlayerModel(
                    estimatedPrevHp,
                    estimatedPrevHp,
                    estimatedPrevMp,
                    estimatedPrevMp,
                    estimatedPrevDefense,
                    estimatedPrevMagicDefense,
                    prevLevel,
                    0,
                    player.totalExp - player.exp,
                    estimatedPrevSpeed,
                    estimatedPrevAttack,
                    estimatedPrevLuck,
                    estimatedPrevPower,
                    [...player.statusEffects]
                );

                console.log(`前のレベル(${prevLevel})ステータスを推測:`, {
                    HP: estimatedPrevHp,
                    MP: estimatedPrevMp,
                    DEF: estimatedPrevDefense,
                    MDEF: estimatedPrevMagicDefense,
                    SPD: estimatedPrevSpeed,
                    ATK: estimatedPrevAttack,
                    LUK: estimatedPrevLuck,
                    POW: estimatedPrevPower
                });
            }
        } catch (error) {
            console.error("レベルアップ通知の初期化中にエラー:", error);
            setHasError(true);
        }
    }, [level, player]);

    // メッセージが表示されているときにEnterキーで閉じる処理
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === " " || e.code === "Space" || e.key === "Enter") {
                // デフォルトの動作を防止
                e.preventDefault();
                onClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    // エラー時の表示
    if (hasError) {
        return (
            <div className="absolute inset-0 flex items-center justify-center z-50 bg-black bg-opacity-75"
                onClick={onClose}>
                <div className="bg-red-800 text-white p-4 rounded-lg">
                    <h3 className="text-xl font-bold mb-2">エラー</h3>
                    <p>レベルアップ表示中に問題が発生しました</p>
                    <button
                        className="mt-4 px-4 py-2 bg-red-600 rounded hover:bg-red-500"
                        onClick={onClose}
                    >
                        閉じる
                    </button>
                </div>
            </div>
        );
    }

    // ステータス増加分を計算
    const prevPlayer = prevPlayerRef.current || player;
    const diffHP = player.maxHP - prevPlayer.maxHP;
    const diffMP = player.maxMP - prevPlayer.maxMP;
    const diffAttack = player.attack - prevPlayer.attack;
    const diffDefense = player.defense - prevPlayer.defense;
    const diffMagicDefense = player.magicDefense - prevPlayer.magicDefense;
    const diffSpeed = player.speed - prevPlayer.speed;
    const diffLuck = player.luck - prevPlayer.luck;
    const diffPower = player.power - prevPlayer.power;

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50"
            onClick={onClose}>
            <div className="relative bg-black bg-opacity-75 text-white px-6 py-4 rounded-lg text-center shadow-xl border-2 border-white"
                onClick={(e) => e.stopPropagation()}>
                {/* 右上の×ボタン */}
                <button
                    className="absolute top-2 right-2 text-white text-xl focus:outline-none"
                    onClick={onClose}
                >
                    ×
                </button>

                <div>
                    <div className="font-bold text-xl mb-2">レベルアップ！ (Lv.{level})</div>
                    <table className="mx-auto text-left text-sm">
                        <tbody>
                            <tr>
                                <td>HP：</td>
                                <td>
                                    {player.maxHP}{" "}
                                    <span className="text-green-500">(+{diffHP})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>MP：</td>
                                <td>
                                    {player.maxMP}{" "}
                                    <span className="text-green-500">(+{diffMP})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>攻撃：</td>
                                <td>
                                    {player.attack}{" "}
                                    <span className="text-green-500">(+{diffAttack})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>防御：</td>
                                <td>
                                    {player.defense}{" "}
                                    <span className="text-green-500">(+{diffDefense})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>魔法防御：</td>
                                <td>
                                    {player.magicDefense}{" "}
                                    <span className="text-green-500">(+{diffMagicDefense})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>スピード：</td>
                                <td>
                                    {player.speed}{" "}
                                    <span className="text-green-500">(+{diffSpeed})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>運：</td>
                                <td>
                                    {player.luck}{" "}
                                    <span className="text-green-500">(+{diffLuck})</span>
                                </td>
                            </tr>
                            <tr>
                                <td>力：</td>
                                <td>
                                    {player.power}{" "}
                                    <span className="text-green-500">(+{diffPower})</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default LevelUpNotifier;