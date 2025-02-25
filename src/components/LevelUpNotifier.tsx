// src/components/LevelUpNotifier.tsx
import React, { useEffect, useRef, useState } from "react";
import { Player as PlayerModel } from "../models/Player";
import { LEVEL_UP_MESSAGE_DURATION } from "../data/constants";

interface LevelUpNotifierProps {
    player: PlayerModel;
}

const LevelUpNotifier: React.FC<LevelUpNotifierProps> = ({ player }) => {
    const [message, setMessage] = useState<React.ReactNode>(null);
    // 前回のプレイヤー状態を保持する ref
    const prevPlayerRef = useRef(player);

    useEffect(() => {
        // プレイヤーのレベルが変化した場合
        if (prevPlayerRef.current.level !== player.level) {
            const diffHP = player.maxHP - prevPlayerRef.current.maxHP;
            const diffMP = player.maxMP - prevPlayerRef.current.maxMP;
            const diffAttack = player.attack - prevPlayerRef.current.attack;
            const diffDefense = player.defense - prevPlayerRef.current.defense;
            const diffMagicDefense = player.magicDefense - prevPlayerRef.current.magicDefense;
            const diffSpeed = player.speed - prevPlayerRef.current.speed;

            const msgContent = (
                <div>
                    <div className="font-bold text-xl mb-2">レベルアップ！ (Lv.{player.level})</div>
                    <table className="mx-auto text-left">
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
                        </tbody>
                    </table>
                </div>
            );

            setMessage(msgContent);
            // 前回の状態を更新
            prevPlayerRef.current = player;

            const timer = setTimeout(() => {
                setMessage(null);
            }, LEVEL_UP_MESSAGE_DURATION);
            return () => clearTimeout(timer);
        }
    }, [player]);

    if (!message) return null;

    return (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-51 bg-black bg-opacity-50 text-white px-6 py-4 rounded-lg text-center shadow-xl border-2 border-white">
            {message}
        </div>
    );
};

export default LevelUpNotifier;
