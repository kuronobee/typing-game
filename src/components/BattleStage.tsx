import React, { useEffect, useState } from "react";
import bg from "../assets/bg/background.png";
import Enemy from "./Enemy";
import { EnemyType } from "../data/enemyData";
import { Question } from "../data/questions";

interface BattleStageProps {
  currentEnemy: EnemyType;
  playerHP: number;
  onEnemyAttack: () => void;
  message: string;
  currentQuestion: Question | null;
  wrongAttempts: number;
  enemyHit: boolean;
  showQuestion: boolean;
}

const BattleStage: React.FC<BattleStageProps> = ({
  currentEnemy,
  playerHP,
  onEnemyAttack,
  message,
  currentQuestion,
  wrongAttempts,
  enemyHit,
  showQuestion,
}) => {
  const [visibleMessage, setVisibleMessage] = useState("");

  useEffect(() => {
    if (message) {
      setVisibleMessage(message);
      const timer = setTimeout(() => setVisibleMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const positionOffset = currentEnemy.positionOffset || { x: 0, y: 0 };

  // 敵の攻撃処理（敵が倒れている場合はスキップ）
  useEffect(() => {
    if (playerHP <= 0 || currentEnemy.currentHP <= 0) return;
    const attackInterval = setInterval(() => {
      onEnemyAttack();
    }, Math.random() * 2000 + 3000);
    return () => clearInterval(attackInterval);
  }, [playerHP, onEnemyAttack, currentEnemy]);

  // ヒント生成関数（各文字間に Unicode THIN SPACE を挿入）
  const getHint = (answer: string, wrongAttempts: number): string => {
    const n = answer.length;
    const hintArray = answer.split("").map((ch) => (ch === " " ? " " : "_"));
    let nonSpaceIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (answer[i] !== " ") {
        nonSpaceIndices.push(i);
      }
    }
    let orderList: number[] = [];
    if (nonSpaceIndices.length > 1) {
      orderList.push(nonSpaceIndices[1]);
    }
    if (nonSpaceIndices.length > 3) {
      orderList.push(nonSpaceIndices[3]);
    }
    for (let idx of nonSpaceIndices) {
      if (!orderList.includes(idx)) {
        orderList.push(idx);
      }
    }
    const reveals = Math.min(wrongAttempts, orderList.length);
    for (let i = 0; i < reveals; i++) {
      const idx = orderList[i];
      hintArray[idx] = answer[idx];
    }
    return hintArray.join("\u2009");
  };

  return (
    <div className="relative w-full h-full">
      {/* 背景画像 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "bottom center",
          backgroundSize: "100% 100%",
        }}
      />

      {/* 敵キャラ表示（コンテナ自体は変形せず、Enemy コンポーネント側でアニメーション） */}
      <div
        className="absolute z-10 transition-all duration-1000 ease-out"
        style={{
          bottom: `calc(30px + ${positionOffset.y}px)`,
          left: `calc(50% + ${positionOffset.x}px)`,
          transform: "translateX(-50%)",
          opacity: 1,
        }}
      >
        <Enemy
          {...currentEnemy}
          enemyHit={enemyHit}
          enemyDefeated={currentEnemy.currentHP <= 0}
        />
      </div>

      {/* 問題コンテナ：敵が倒れている場合は非表示 */}
      {currentQuestion && currentEnemy.currentHP > 0 && (
        <div
          key={currentQuestion.id}
          className={`absolute top-10 left-1/2 transform -translate-x-1/2 z-30 
            bg-black/50 border-white border-2 text-white px-4 py-2 rounded
            transition-all duration-500 ease-in-out ${
              showQuestion ? "opacity-100 scale-100" : "opacity-0"
            }`}
        >
          <p className="font-bold">問題: {currentQuestion.prompt}</p>
          <p className="mt-2">
            ヒント: {getHint(currentQuestion.answer, wrongAttempts)}
          </p>
        </div>
      )}

      {/* メッセージ表示 */}
      <div
        className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20 
          bg-black/50 border-white border-2 text-white px-4 py-2 rounded 
          transition-all duration-500 ease-in-out ${
            visibleMessage ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
          }`}
      >
        <p>{visibleMessage}</p>
      </div>
    </div>
  );
};

export default BattleStage;
