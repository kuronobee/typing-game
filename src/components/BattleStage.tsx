// src/components/BattleStage.tsx の修正版 - isCompactパラメータの削除とコンパクトモードの常時適用

import React, { useEffect, useState, useRef } from "react";
import bg from "../assets/bg/background.png";
import playerImage from "../assets/chara/player.png"; // パスを修正
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
import SkillCallOut from "./SkillCallOut";

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
  inputRef: React.RefObject<HTMLInputElement | null>;
  playerHitEffect?: boolean;
  playerDamageDisplay?: { value: number; id: number } | null;
  expGain: number | null;
  playerAttackEffect?: boolean;
  enemyRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  skillAnimationInProgress?: boolean;
  skillCallOut?: string | null;
  specialAttackTypes?: (string | null)[]; // 追加: 特殊攻撃の種類
  criticalHits?: boolean[];
  playerReff?: React.RefObject<HTMLDivElement | null>;
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
  inputRef,
  playerHitEffect = false,
  playerDamageDisplay = null,
  expGain,
  playerAttackEffect = false,
  enemyRefs,
  skillAnimationInProgress = false,
  skillCallOut = null,
  specialAttackTypes = [],
  criticalHits = [],
  playerReff,
}) => {
  // 各敵毎の攻撃ゲージ進捗を管理する配列(0〜1)
  const [attackProgresses, setAttackProgresses] = useState<number[]>([]);

  // 瀕死状態の点滅効果用
  const [pulseState, setPulseState] = useState(false);

  // プレイヤーの最新情報を保持するための ref
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // HP低下時の点滅効果
  useEffect(() => {
    if (player.hp <= player.maxHP * 0.3) {
      const interval = setInterval(() => {
        setPulseState(prev => !prev);
      }, 1000); // 1秒ごとに点滅
      return () => clearInterval(interval);
    }
  }, [player.hp, player.maxHP]);

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
      if (skillAnimationInProgress) return; // スキルアニメーション中は進捗を停止
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

  // 常にコンパクトモードとして扱う
  const mainContainerClasses = `
    relative w-full z-50 
    transition-all duration-300
  `;

  // バトルステージ部分のクラス
  const battleStageClasses = `
    relative w-full
    compact-battle-stage p-0
    transition-all duration-300
  `;

  // 敵の配置調整用の値計算
  const getEnemyPosition = (enemy: EnemyModel) => {
    let baseY = enemy.positionOffset?.y || 0;
    let baseX = enemy.positionOffset?.x || 0;

    // 常にコンパクトモード調整を適用
    baseY -= 60;
    if (currentEnemies.length > 1) {
      baseX = baseX * 0.85;
    }

    return { x: baseX, y: baseY };
  };

  // プレイヤーの健康状態に基づくフィルター効果 - より控えめに
  const getPlayerImageFilter = () => {
    const healthPercentage = player.hp / player.maxHP;

    if (healthPercentage <= 0.3) {
      // 瀕死状態でも視認性を確保
      return pulseState ? "sepia(0.3)" : "grayscale(0.3)";
    } else if (healthPercentage <= 0.7) {
      return "sepia(0.2)";
    }
    return "none";
  };

  // 基本的な高さ設定
  const battleAreaHeight = "h-100";
  // プレイヤー領域の高さ
  const playerAreaHeight = 100; // px単位

  // HP低下時のプレイヤー領域の背景色
  const getPlayerAreaBackground = () => {
    const healthPercentage = player.hp / player.maxHP;

    if (healthPercentage <= 0.3) {
      // 瀕死状態では背景を赤く点滅
      return pulseState ? 'rgba(220, 38, 38, 0.3)' : 'rgba(0, 0, 0, 0.3)';
    }
    return 'rgba(0, 0, 0, 0.3)'; // 通常時は黒背景
  };

  return (
    <div className={mainContainerClasses}>
      {/* バトルステージ部分 */}
      <div className={`${battleStageClasses} ${battleAreaHeight}`}>
        {/* 背景画像 */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${bg})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center 70%",
            //backgroundSize: "90%",
          }}
        />

        {/* 瀕死状態の表示 - 非常に控えめな赤い境界線のみ */}
        {player.hp <= player.maxHP * 0.3 && (
          <div
            className="absolute top-0 left-0 right-0 h-2 z-25"
            style={{
              backgroundColor: pulseState ? 'rgba(220, 38, 38, 0.5)' : 'rgba(220, 38, 38, 0.3)',
              transition: 'background-color 0.5s ease'
            }}
          />
        )}

        {/* 敵の表示 */}
        {currentEnemies.map((enemy, index) => {
          const isTarget = index === targetIndex;
          const enemyProgress = attackProgresses[index] || 0;
          const position = getEnemyPosition(enemy);

          return (
            <div
              key={index}
              className="absolute z-10"
              style={{
                bottom: `calc(160px + ${position.y}px)`,
                left: `calc(50% + ${position.x}px)`,
                transform: "translateX(-50%)",
              }}
              onClick={(e) => {
                e.preventDefault();
                if (!enemy.defeated) {
                  onSelectTarget(index);
                }
              }}
              ref={(el) => {
                // 敵要素のRefを設定
                if (enemyRefs.current) {
                  enemyRefs.current[index] = el;
                }
              }}
            >
              <Enemy
                enemy={enemy}
                enemyHit={enemyHitFlags[index]}
                playerHit={enemyAttackFlags[index]}
                playerFire={enemyFireFlags[index]}
                enemyDefeated={enemy.defeated}
                showHealth={isTarget}
                showTargetIndicator={isTarget}
                progress={enemyProgress}
                damage={damageNumbers[index]}
                comboCount={comboCount}
                scaleAdjustment={0.8}
                specialAttackType={specialAttackTypes[index] || null} // 追加: 特殊攻撃の種類
                isCriticalHit={criticalHits[index] || false}
              />
            </div>
          );
        })}
        {/* プレイヤーキャラクターの上にスキルコールアウトを表示 */}
        {skillCallOut && (
          <SkillCallOut skillName={skillCallOut} />
        )}
        {/* 質問コンテナ */}
        {currentEnemies[targetIndex] &&
          currentEnemies[targetIndex].currentHP > 0 && (
            <div
              className="absolute left-1/2 transform -translate-x-1/2 top-0 w-[99%] z-30 transition-all duration-300"
            >
              <QuestionContainer
                question={currentQuestion}
                wrongAttempts={wrongAttempts}
                attackProgress={targetProgress}
                onFullRevealChange={onFullRevealChange}
                inputRef={inputRef}
              />
            </div>
          )}

        {/* メッセージ表示 */}
        <div className="transition-all duration-300">
          <MessageDisplay
            newMessage={message}
            position="bottom-30"
          />
        </div>
      

      {/* プレイヤー領域 - HP低下時に背景が点滅 */}
      <div
        className="w-full relative background-transparent"
        style={{
          height: `${playerAreaHeight}px`,
          //backgroundColor: getPlayerAreaBackground(),
          //transition: 'background-color 0.5s ease'
        }}
      >
        {/* レベル表示 - 左側に配置 */}
        <div
          className="absolute z-30 left-2 top-[25%] transform -translate-y-1/2 bg-gray-800/30 p-3 rounded-lg border border-gray-600 shadow-lg player-status-panel"
          style={{ 
            minWidth: '130px', 
            maxWidth: '1000px', 
            width: '35%', 
            height: '80px',
          }}
        >
          <div className="text-white font-bold text-xl text-center">Lv. {player.level}</div>
          <div className="flex flex-col justify-between h-[50px]">
            <div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-white">EXP</span>
                <span className="text-xs text-white">{player.exp}/{player.levelUpThreshold}</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{ width: `${(player.exp / player.levelUpThreshold) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="flex flex-col items-center mt-1 mb-1">
              {expGain && (
                <div className="text-xs text-yellow-300 text-center animate-pulse mb-1">+{expGain} EXP</div>
              )}
              <div className="text-xs text-gray-300 text-center">
                Total: {player.totalExp.toLocaleString()} EXP
              </div>
            </div>
          </div>
        </div>

        {/* プレイヤーキャラクター表示 - 中央に */}
        <div
          className={`absolute z-20 pointer-events-none ${playerHitEffect 
            ? 'player-shake' : playerAttackEffect ? 'player-attack-m' : ''
            }`}
            style={{
              top: `-90px`,
              left: "50%",
              transform: "translateX(-50%)",
              width: "160px",
              height: "240px",
              transition: "all 0.3s ease"
            }}
            ref={playerReff}
        >
          <img
            src={playerImage}
            alt="Player Character"
            className="w-full h-full object-contain"
            style={{
              filter: getPlayerImageFilter(),
              transition: "filter 0.5s ease"
            }}
          />

          {/* プレイヤーダメージ表示 */}
          {playerDamageDisplay && (
            <div
              key={playerDamageDisplay.id}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-red-500 font-bold text-3xl animate-damage-fade"
              style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)', zIndex: 30 }}
            >
              {playerDamageDisplay.value}
            </div>
          )}
        </div>

        {/* HP/MP表示 - 右側に配置 */}
        <div
          className="absolute z-30 right-2 top-[25%] transform -translate-y-1/2 bg-gray-800/80 p-3 rounded-lg border border-gray-600 shadow-lg player-status-panel"
          style={{ 
            minWidth: '130px', 
            maxWidth: '1000px', 
            width: '35%', 
            height: '80px',
            backgroundColor: getPlayerAreaBackground(),
            transition: 'background-color 0.5s ease'
           }}
        >
          <div className="flex flex-col justify-center h-[60px]">
            {/* HPゲージ */}
            <div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-white">HP</span>
                <span className="text-xs text-white">{player.hp}/{player.maxHP}</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden mb-2">
                <div
                  className={`h-full transition-all ${player.statusEffects.some(effect => effect.type === "poison") ? "bg-purple-500" : "bg-green-500"}`}
                  style={{ width: `${(player.hp / player.maxHP) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* MPゲージ */}
            <div>
              <div className="flex justify-between">
                <span className="text-xs font-bold text-white">MP</span>
                <span className="text-xs text-white">{player.mp}/{player.maxMP}</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all"
                  style={{ width: `${(player.mp / player.maxMP) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default BattleStage;