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

type DamageDisplay = {
  value: number;
  id: number;
};

interface BattleStageProps {
  currentEnemies: EnemyModel[];
  targetIndex: number;
  player: Player;
  onEnemyAttack: (enemy: EnemyModel) => void;
  message: MessageType | null;
  currentQuestion: Question | null;
  wrongAttempts: number;
  enemyHitFlags: boolean[];
  enemyAttackFlags: boolean[];
  enemyFireFlags: boolean[];
  damageNumbers: (DamageDisplay | null)[];
  onFullRevealChange: (fullReveal: boolean) => void;
  onSelectTarget: (index: number) => void;
  comboCount: number;
  showCombo: boolean;
}

const BattleStage: React.FC<BattleStageProps> = ({
  currentEnemies,
  targetIndex,
  player,
  onEnemyAttack,
  message,
  currentQuestion,
  wrongAttempts,
  enemyHitFlags = [],
  enemyAttackFlags = [],
  enemyFireFlags = [],
  damageNumbers = [],
  onFullRevealChange,
  onSelectTarget,
  comboCount,
  showCombo,
}) => {
  // 各敵毎の攻撃ゲージ進捗を管理する配列(0〜1)
  const [attackProgresses, setAttackProgresses] = useState<number[]>([]);

  // プレイヤーの最新情報を保持するための ref
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // currentEnemiesが変わったら、ゲージの進捗配列を初期化する
  useEffect(() => {
    setAttackProgresses(currentEnemies.map(() => 0));
  }, [currentEnemies]);

  useEffect(() => {
    if (enemyHitFlags[targetIndex]) {
      setAttackProgresses((prevProgresses) => {
        const updated = [...prevProgresses];
        updated[targetIndex] = 0;
        return updated;
      });
    }
  }, [enemyHitFlags, targetIndex])

  // 各敵のゲージをバックグラウンドで進行させるタイマー
  useEffect(() => {
    const timerId = setInterval(() => {
      setAttackProgresses((prevProgresses) => prevProgresses.map((progress, i) => {
        const enemy = currentEnemies[i];
        // 敵が存在しない、または敵が倒れている場合はタイマーを起動しない
        if (!enemy || enemy.defeated) return 0;
        const effectiveSpeed = enemy.speed - playerRef.current.speed;
        if (effectiveSpeed <= 0) return progress;
        const attackInterval = (MAX_EFFECTIVE_SPEED / effectiveSpeed) * MS_IN_SECOND;
        let newProgress = progress + TICK_INTERVAL / attackInterval;
        if (newProgress >= 1) {
          // ゲージが万端になったらその敵の攻撃を実行し、進捗をリセット
          // 非同期に onEnemyAttack を呼ぶことで、レンダリング中の更新を回避
          setTimeout(() => {
            onEnemyAttack(enemy);
          }, 0);
          newProgress = 0;
        }
        return newProgress;
      }));
    }, TICK_INTERVAL);
    return () => clearInterval(timerId);
  }, [currentEnemies, onEnemyAttack]);

  // ターゲット敵の攻撃ゲージ進捗
  const targetProgress = attackProgresses[targetIndex] || 0;

  return (
    <div className="top-1/4 z-50 relative w-full h-full">
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
      {/* 複数の敵を表示 */}
      {currentEnemies.map((enemy, index) => {
        const isTarget = index === targetIndex;
        // 各敵の進捗はattackProgresses[index]に入っている
        const enemyProgress = attackProgresses[index] || 0;
        return (
          <div
            key={index}
            className="absolute z-10 transition-all duration-1000 ease-out"
            style={{
              bottom: `calc(70px + ${enemy.positionOffset?.y || 0}px)`,
              left: `calc(50% + ${enemy.positionOffset?.x || 0}px)`,
              transform: "translateX(-50%)",
              opacity: enemy.currentHP > 0 ? 1 : 0,
            }}
            onClick={() => {
              if (!enemy.defeated) {
                onSelectTarget(index);
              }
            }}
          >
            <Enemy
              enemy={enemy}
              enemyHit={enemyHitFlags[index]}
              playerHit={enemyAttackFlags[index]}
              playerFire={enemyFireFlags[index]}
              // 他のアニメーション用フラグも必要に応じて
              enemyDefeated={enemy.currentHP <= 0}
              showHealth={isTarget}
              showTargetIndicator={isTarget}
              progress={enemyProgress}
              damage={damageNumbers[index]}
            />
            {/* コンボ表示: ターゲットかつコンボ数が2以上なら表示 */}
            {isTarget && comboCount > 1 && showCombo && (
              <div 
                key={comboCount}
                className="absolute top-[-30px] left-1/2 transform -translate-x-1/2 text-yellow-400 font-bold text-xl animate-combo-fade">
                {comboCount}Combo
              </div>
            )}
          </div>
        );
      })}
      {/* ターゲット敵の質問コンテナのみ表示 */}
      {currentEnemies[targetIndex] &&
        currentEnemies[targetIndex].currentHP > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[90%] z-30">
            <QuestionContainer
              question={currentQuestion}
              wrongAttempts={wrongAttempts}
              attackProgress={targetProgress}
              onFullRevealChange={onFullRevealChange}
            />
          </div>
        )}
      {/* メッセージ表示 */}
      <MessageDisplay newMessage={message} />
    </div>
  );
};

export default BattleStage;
