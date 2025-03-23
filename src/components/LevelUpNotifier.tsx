// src/components/LevelUpNotifier.tsx - 修正版
import React, { useEffect, useRef } from "react";
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
  
  // このレベルで習得するスキル情報
  const skillsForLevel = ExperienceManager.LEVEL_SKILLS
    .filter(skill => skill.level === level)
    .map(skill => skill.skillName);
  
  console.log(`レベル${level}での習得スキル:`, skillsForLevel);
  
  // コンポーネントマウント時に一度だけprevPlayerを設定
  useEffect(() => {
    // prevPlayerにはレベルアップ前の状態を推測して設定
    if (!prevPlayerRef.current) {
      // 現在のプレイヤーからレベルが1つ低い状態を作成
      const prevLevel = level - 1;
      const estimatedPrevHp = player.maxHP - 10;
      const estimatedPrevMp = player.maxMP - 5;
      const estimatedPrevDefense = player.defense - 1;
      const estimatedPrevMagicDefense = player.magicDefense - 1;
      const estimatedPrevSpeed = player.speed - 1;
      const estimatedPrevAttack = player.attack - 2;
      const estimatedPrevLuck = player.luck - 1;
      const estimatedPrevPower = player.power - 1;
      
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
    }
  }, [level, player]);

  // メッセージが表示されているときにEnterキーで閉じる処理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        // デフォルトの動作（スペース入力）を防止
        e.preventDefault();
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

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
          
          {/* このレベルで習得するスキル情報 */}
          {skillsForLevel.length > 0 && (
            <div className="mt-4 text-yellow-300">
              <p className="font-bold">新しいスキルを習得！</p>
              <ul className="mt-2">
                {skillsForLevel.map((skillName, index) => (
                  <li key={index} className="text-yellow-200">「{skillName}」</li>
                ))}
              </ul>
            </div>
          )}
          
          <p className="mt-4 text-sm">タップまたはSpaceキーで閉じる</p>
        </div>
      </div>
    </div>
  );
};

export default LevelUpNotifier;