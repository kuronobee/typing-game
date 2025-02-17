// src/components/BattleStage.tsx
import React, { useEffect, useState, useRef } from "react";
import bg from "../assets/bg/background.png";
import Enemy from "./Enemy";
import {
  MAX_EFFECTIVE_SPEED,
  MS_IN_SECOND,
  TICK_INTERVAL,
} from "../data/constants";
import { Question } from "../data/questions";
import QuestionContainer from "./QuestionContainer";
import { Player } from "../models/Player";
import { Enemy as EnemyModel } from "../models/EnemyModel";
import MessageDisplay, { MessageType } from "./MessageDisplay";

interface BattleStageProps {
  currentEnemy: EnemyModel;
  player: Player;
  onEnemyAttack: () => void;
  message: MessageType | null;
  currentQuestion: Question | null;
  wrongAttempts: number;
  enemyHit: boolean;
  showQuestion: boolean;
}

const BattleStage: React.FC<BattleStageProps> = ({
  currentEnemy,
  player,
  onEnemyAttack,
  message,
  currentQuestion,
  wrongAttempts,
  enemyHit,
  showQuestion,
}) => {
  const [attackProgress, setAttackProgress] = useState(0);
  const attackStartTimeRef = useRef<number>(Date.now());

  // プレイヤーの最新情報を保持するための ref
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  const positionOffset = currentEnemy.positionOffset || { x: 0, y: 0 };

  useEffect(() => {
    // 敵が存在しない、または敵が倒れている場合はタイマーを起動しない
    if (!currentEnemy || currentEnemy.currentHP <= 0) return;
    // プレイヤーの最新の速度を ref から取得する
    const effectiveSpeed = (currentEnemy.speed || 0) - playerRef.current.speed;
    if (effectiveSpeed <= 0) {
      setAttackProgress(0);
      return;
    }
    const attackInterval = (MAX_EFFECTIVE_SPEED / effectiveSpeed) * MS_IN_SECOND;
    attackStartTimeRef.current = Date.now();

    const tick = () => {
      const elapsed = Date.now() - attackStartTimeRef.current;
      if (elapsed >= attackInterval) {
        onEnemyAttack();
        attackStartTimeRef.current = Date.now();
        setAttackProgress(0);
      } else {
        setAttackProgress(elapsed / attackInterval);
      }
    };

    const timerId = setInterval(tick, TICK_INTERVAL);
    return () => clearInterval(timerId);
  }, [currentEnemy, onEnemyAttack]); // player.hp や player.speed は依存配列に含めない

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
      {/* 敵キャラ表示 */}
      <div
        className="absolute z-10 transition-all duration-1000 ease-out"
        style={{
          bottom: `calc(60px + ${positionOffset.y}px)`,
          left: `calc(50% + ${positionOffset.x}px)`,
          transform: "translateX(-50%)",
          opacity: 1,
        }}
      >
        <Enemy
          enemy={currentEnemy}
          enemyHit={enemyHit}
          enemyDefeated={currentEnemy.currentHP <= 0}
        />
      </div>
      {/* 攻撃インジケータ */}
      {currentQuestion && currentEnemy.currentHP > 0 && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 w-64">
          <div className="w-full h-2 bg-gray-300 rounded">
            <div
              className="h-full bg-red-500 rounded"
              style={{ width: `${Math.min(attackProgress * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      )}
      {/* 問題コンテナ */}
      {currentQuestion && currentEnemy.currentHP > 0 && (
        <QuestionContainer question={currentQuestion} wrongAttempts={wrongAttempts} />
      )}
      {/* メッセージ表示 */}
      <MessageDisplay newMessage={message} />
    </div>
  );
};

export default BattleStage;
