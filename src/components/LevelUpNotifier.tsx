// src/components/LevelUpNotifier.tsx
import React, { useEffect, useRef, useState } from "react";
import { Player as PlayerModel } from "../models/Player";

interface LevelUpNotifierProps {
    player: PlayerModel;
    onClose: () => void;
}

const LevelUpNotifier: React.FC<LevelUpNotifierProps> = ({ player, onClose }) => {
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
                    <p className="mt-4 text-sm">press Enter</p>
                </div>
            );

            setMessage(msgContent);
            // 前回の状態を更新
            prevPlayerRef.current = player;
        }
    }, [player]);

    // メッセージが表示されているときにEnterキーで閉じる処理
    useEffect(() => {
        if(!message) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter") {
                setMessage(null);
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [message, onClose]);

    if (!message) return null;

    return (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="relative bg-black bg-opacity-75 text-white px-6 py-4 rounded-lg text-center shadow-xl border-2 border-white">
            {/* 右上の×ボタン */}
            <button
              className="absolute top-2 right-2 text-white text-xl focus:outline-none"
              onClick={() => {
                setMessage(null);
                onClose();
            }}
            >
              ×
            </button>
            {message}
          </div>
        </div>
      );};

export default LevelUpNotifier;
