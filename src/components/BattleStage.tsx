// src/components/BattleStage.tsx - 余白最小化版
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
  isKeyboardVisible?: boolean;
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
  isKeyboardVisible = false,
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
  }, [enemyHitFlags, targetIndex]);

  // 各敵のゲージをバックグラウンドで進行させるタイマー
  useEffect(() => {
    const timerId = setInterval(() => {
      setAttackProgresses((prevProgresses) =>
        prevProgresses.map((progress, i) => {
          const enemy = currentEnemies[i];
          // 敵が存在しない、または敵が倒れている場合はタイマーを起動しない
          if (!enemy || enemy.defeated) return 0;
          const effectiveSpeed = enemy.speed - playerRef.current.speed;
          if (effectiveSpeed <= 0) return progress;
          const attackInterval =
            (MAX_EFFECTIVE_SPEED / effectiveSpeed) * MS_IN_SECOND;
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
        })
      );
    }, TICK_INTERVAL);
    return () => clearInterval(timerId);
  }, [currentEnemies, onEnemyAttack]);

  // ターゲット敵の攻撃ゲージ進捗
  const targetProgress = attackProgresses[targetIndex] || 0;

  // コンパクトモード用のクラス調整
  const containerClasses = `
    relative w-full h-80 z-50
    ${isKeyboardVisible ? "compact-battle-stage p-0" : "p-2"}
    transition-all duration-300
  `;

  // 敵の配置調整用の値計算
  const getEnemyPosition = (enemy: EnemyModel) => {
    // 基本位置
    let baseY = enemy.positionOffset?.y || 0;
    let baseX = enemy.positionOffset?.x || 0;

    // キーボード表示時の位置調整
    if (isKeyboardVisible) {
      // 上に60px移動（より上方に配置）
      baseY -= 60;

      // 複数の敵がいる場合は横に少し圧縮して全体を表示
      if (currentEnemies.length > 1) {
        baseX = baseX * 0.85; // 横方向を85%に縮小
      }
    }
    return { x: baseX, y: baseY };
  };

  return (
    <div className={containerClasses}>
      {/* 背景画像 - コンパクトモード時に位置調整 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${bg})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: isKeyboardVisible
            ? "center 70%"
            : "bottom center", // 背景位置調整
          backgroundSize: isKeyboardVisible ? "90% auto" : "100% 100%", // サイズ調整
        }}
      />

      {/* 複数の敵を表示 */}
      {currentEnemies.map((enemy, index) => {
        const isTarget = index === targetIndex;
        const enemyProgress = attackProgresses[index] || 0;

        // 位置計算
        const position = getEnemyPosition(enemy);

        return (
          <div
            key={index}
            className="absolute z-10"
            style={{
              // 敵のベース位置をより高くする（70px→50px）
              bottom: `calc(${isKeyboardVisible ? "80px" : "70px"} + ${
                position.y
              }px)`,
              left: `calc(50% + ${position.x}px)`,
              transform: "translateX(-50%)",
              //opacity: enemy.currentHP > 0 ? 1 : 0,
            }}
            onClick={(e) => {
              // デフォルトの動作を抑制してフォーカスが失われるのを防ぐ
              e.preventDefault();
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
              enemyDefeated={enemy.currentHP <= 0}
              showHealth={isTarget}
              showTargetIndicator={isTarget}
              progress={enemyProgress}
              damage={damageNumbers[index]}
              comboCount={comboCount}
              scaleAdjustment={isKeyboardVisible ? 0.80 : 1} // キーボード表示時は65%に縮小
            />
          </div>
        );
      })}

      {/* ターゲット敵の質問コンテナ - コンパクトモード時に上部に固定 */}
      {currentEnemies[targetIndex] &&
        currentEnemies[targetIndex].currentHP > 0 && (
          <div
            className={`absolute left-1/2 transform -translate-x-1/2 
              ${isKeyboardVisible ? "top-0 w-[99%]" : "top-4 w-[90%]"} 
              z-30 transition-all duration-300`}
          >
            <QuestionContainer
              question={currentQuestion}
              wrongAttempts={wrongAttempts}
              attackProgress={targetProgress}
              onFullRevealChange={onFullRevealChange}
              isCompact={isKeyboardVisible}
            />
          </div>
        )}

      {/* メッセージ表示 - コンパクトモード時に位置調整 */}
      <div className={`transition-all duration-300`}>
        <MessageDisplay
          newMessage={message}
          isCompact={isKeyboardVisible}
          position={isKeyboardVisible ? "bottom-6" : "bottom-20"} // 位置を動的に調整
        />
      </div>
    </div>
  );
};

export default BattleStage;
