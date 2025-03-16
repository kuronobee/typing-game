// src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import LevelUpNotifier from "./components/LevelUpNotifier";
import CombatEffects from "./components/CombatEffects";
import NextStageButton from "./components/NextStageButton";

import { commonQuestions, Question } from "./data/questions";
import { Player as PlayerModel } from "./models/Player";
import { Enemy as EnemyModel } from "./models/EnemyModel";
import { MessageType } from "./components/MessageDisplay";
import { ENEMY_HIT_ANIMATION_DURATION } from "./data/constants";

// カスタムフックのインポート
import useKeyboardVisibility from "./hooks/useKeyboardVisibility";
import useIOSScrollPrevention from "./hooks/useIOSScrollPrevention";
import { useCombatSystem } from "./hooks/useCombatSystem";
import { usePlayerAttack } from "./hooks/usePlayerAttack";
//import { useLevelTracking } from "./hooks/useLevelTracking";

// マネージャークラスのインポート
import { StageManager } from "./managers/StageManager";
import { ExperienceManager } from "./managers/ExperienceManager";

const App: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // マウント時に入力フィールドにフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // カスタムフックの使用
  const isKeyboardVisible = useKeyboardVisibility(inputRef);
  useIOSScrollPrevention(inputRef);

  // プレイヤーの状態
  const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());

  // 戦闘関連の状態
  const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
  );
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);
  const [comboCount, setComboCount] = useState<number>(0);
  const [readyForNextStage, setReadyForNextStage] = useState(false);

  // UI状態
  const [message, setMessage] = useState<MessageType | null>({
    text: "問題に正しく回答して敵を倒せ！",
    sender: "system",
  });
  const [expGain, setExpGain] = useState<number | null>(null);

  // タイマーと追跡用のref
  const questionTimeoutRef = useRef<number | null>(null);

  const [isDead, setIsDead] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // レベルアップ追跡フック
  const [showLevelUp, setShowLevelUp] = useState(false);

  // 戦闘システムフック
  const combat = useCombatSystem(player, setPlayer, currentEnemies, setMessage);

  // プレイヤー更新時のrefを更新
  useEffect(() => {
    combat.updatePlayerRef();
  }, [player, combat.updatePlayerRef]);

  // 敵が変わったときにアニメーション配列を初期化
  useEffect(() => {
    combat.initializeAnimations();
  }, [currentEnemies, combat.initializeAnimations]);

  // マウント時に初期ステージを生成
  useEffect(() => {
    spawnNewStage();
  }, []);

  // ターゲットが変わったときに現在の問題を更新
  useEffect(() => {
    if (currentEnemies.length > 0) {
      const targetEnemy = currentEnemies[targetIndex];
      if (targetEnemy && !targetEnemy.defeated) {
        setCurrentQuestion(
          targetEnemy.presentedQuestion || targetEnemy.getNextQuestion()
        );
      }
    }
  }, [targetIndex, currentEnemies]);

  // プレイヤー攻撃フック
  const playerAttack = usePlayerAttack(
    player,
    setComboCount,
    setWrongAttempts,
    setMessage,
    isHintFullyRevealed
  );

  // タブによるターゲット選択とステージ進行のためのキーダウンイベント処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Shift+Tabで反時計回りにターゲット選択
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        if (currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          setTargetIndex((prev) => {
            const findPrevAliveIndex = (index: number): number => {
              let newIndex = index - 1;
              if (newIndex < 0) {
                newIndex = currentEnemies.length - 1;
              }
              if (currentEnemies[newIndex].defeated) {
                return findPrevAliveIndex(newIndex);
              }
              return newIndex;
            };
            return findPrevAliveIndex(prev);
          });
        }
      }
      // Tabで時計回りにターゲット選択
      else if (event.key === "Tab") {
        event.preventDefault();
        if (currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          setTargetIndex((prev) => {
            const findNextAliveIndex = (index: number): number => {
              const newIndex = (index + 1) % currentEnemies.length;
              if (newIndex === index) return index;
              if (currentEnemies[newIndex].defeated) {
                return findNextAliveIndex(newIndex);
              }
              return newIndex;
            };
            return findNextAliveIndex(prev);
          });
        }
      }
      // Enterで次のステージへ進む
      else if (event.key === "Enter" && readyForNextStage) {
        spawnNewStage();
        setReadyForNextStage(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readyForNextStage, currentEnemies]);

  // アンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    };
  }, []);

  // プレイヤーが敵を攻撃する処理
  // プレイヤーが敵を攻撃する処理
  const handlePlayerAttack = (input: string) => {
    if (!currentEnemies.length) return;

    const targetEnemy = currentEnemies[targetIndex];
    if (!targetEnemy || targetEnemy.defeated) return;

    if (!currentQuestion) {
      setCurrentQuestion(targetEnemy.getNextQuestion());
    }

    const trimmedInput = input.trim();

    // 問題の正解から<>タグを除去
    const cleanedAnswer = currentQuestion.answer.replace(/<|>/g, '');

    if (trimmedInput.toLowerCase() === cleanedAnswer.toLowerCase()) {
      // 正解の場合
      const newCombo = comboCount + 1;
      playerAttack.handleComboUpdate(newCombo);

      const { damage, specialMessage } = playerAttack.calculateEffectiveDamage(
        currentQuestion,
        targetEnemy,
        newCombo,
        wrongAttempts
      );
      targetEnemy.takeDamage(damage);

      // ダメージ表示とヒットアニメーション
      combat.setDamageDisplay(targetIndex, damage);
      combat.setHitFlag(targetIndex, ENEMY_HIT_ANIMATION_DURATION);

      // ダメージメッセージを設定
      playerAttack.setAttackResultMessage(damage, specialMessage);

      setWrongAttempts(0);

      // 敵が倒されたかチェック
      if (targetEnemy.defeated) {
        playerAttack.setEnemyDefeatedMessage(targetEnemy.name);

        // 次のターゲットを探す
        const nextIndex = StageManager.findNextAliveEnemyIndex(targetIndex, currentEnemies);
        if (nextIndex !== -1) {
          setTargetIndex(nextIndex);
        }
      } else {
        // 次の問題を取得
        setCurrentQuestion(targetEnemy.getNextQuestion());
      }

      // ステージが完了したかチェック
      checkStageCompletion();
    } else {
      // 不正解の場合
      playerAttack.setWrongAnswerMessage();
    }
  };

  // すべての敵が倒されたかチェック
  const checkStageCompletion = () => {
    const allDefeated = StageManager.isStageCompleted(currentEnemies);
    if (allDefeated) {
      const totalEXP = StageManager.calculateTotalExp(currentEnemies);
      gainEXP(totalEXP);

      setMessage(StageManager.createCompletionMessage(totalEXP));

      setTimeout(() => {
        setReadyForNextStage(true);
      }, 2000);
    }
  };

  // プレイヤーに経験値を付与
  const gainEXP = (amount: number) => {
    console.log(`経験値獲得: ${amount}EXP`);

    // ExperienceManager から setShowLevelUp も渡すように変更
    const lvu = ExperienceManager.gainExperience(
      amount,
      player,
      setPlayer,
      setExpGain,
    );

    setShowLevelUp(lvu);
    // ステージ完了メッセージを設定
    setMessage(StageManager.createCompletionMessage(amount));
  };
  // 新しい戦闘ステージを生成
  const spawnNewStage = () => {
    const { enemies, message } = StageManager.createNewStage();
    setCurrentEnemies(enemies);
    setTargetIndex(0);
    setMessage(message);
  };

  // ターゲット選択の処理
  const handleSelectTarget = (index: number) => {
    setTargetIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // 死亡後のゲーム継続処理
  const handleContinueGame = () => {
    setIsDead(false);
    setShowGameOver(false);
    // プレイヤーを最大HPの半分で復活
    setPlayer((prev) => {
      const revivedHP = Math.ceil(prev.maxHP * 0.5);
      return new PlayerModel(
        revivedHP,
        prev.maxHP,
        prev.maxMP,
        prev.maxMP,
        prev.defense,
        prev.magicDefense,
        prev.level,
        prev.exp,
        prev.totalExp,
        prev.speed,
        prev.attack,
        prev.luck,
        prev.power,
        []
      );
    });

    setMessage({
      text: "力を取り戻した！戦いを続ける！",
      sender: "system",
    });

    // すべての敵が倒された場合は新しいステージを生成
    if (currentEnemies.every(enemy => enemy.defeated)) {
      spawnNewStage();
    }
  };

  // 次のステージへ進むハンドラ
  const handleNextStage = () => {
    spawnNewStage();
    setReadyForNextStage(false);
  };

  // プレイヤーが死亡したらゲームオーバー画面を表示(戦闘不能になってから5秒後)
  useEffect(() => {
    if (player.hp <= 0) {
      setIsDead(true);
      setTimeout(() => {
        setShowGameOver(true);
        setIsDead(false);
      }, 5000
      );
    }
  }, [player.hp]);

  return (
    <CombatEffects
      isScreenHit={combat.isScreenHit}
      isScreenShake={combat.isScreenShake}
    >
      {isDead &&
        <div className="absolute inset-0 bg-black opacity-70 z-100 flex items-center justify-center">
          <span className="text-white font-bold text-xl">戦闘不能…</span>
        </div>
      }
      {showGameOver &&
        <GameOver
          totalEXP={player.totalExp}
          onContinue={handleContinueGame}
        />}
      {!showGameOver &&
        <div className="bg-black">
          {/* BattleInterface */}
          <div
            className={`${isKeyboardVisible
                ? "flex-[0.7]" // キーボード表示時は70%の高さ
                : "flex-[0.55]" // 通常時は55%の高さ
              } bg-gray-900 transition-all duration-300`}
          >
            <BattleInterface
              player={player}
              onSubmit={handlePlayerAttack}
              expGain={expGain}
              inputRef={inputRef}
              isKeyboardVisible={isKeyboardVisible}
            />
          </div>

          {/* BattleStage */}
          <div
            className={`relative ${isKeyboardVisible
                ? "flex-[0.4]" // キーボード表示時は40%の高さ
                : "flex-[0.45]" // 通常時は45%の高さ
              } overflow-hidden transition-all duration-300`}
          >
            <BattleStage
              currentEnemies={currentEnemies}
              targetIndex={targetIndex}
              player={player}
              onEnemyAttack={combat.handleEnemyAttack}
              message={message}
              currentQuestion={currentQuestion}
              wrongAttempts={wrongAttempts}
              enemyHitFlags={combat.enemyHitFlags}
              enemyAttackFlags={combat.enemyAttackFlags}
              enemyFireFlags={combat.enemyFireFlags}
              damageNumbers={combat.damageNumbers}
              onFullRevealChange={setIsHintFullyRevealed}
              onSelectTarget={handleSelectTarget}
              comboCount={comboCount}
              isKeyboardVisible={isKeyboardVisible}
            />

            {/* レベルアップ通知 */}
            {showLevelUp && (
              <LevelUpNotifier
                player={player}
                onClose={() => setShowLevelUp(false)}
              />
            )}

            {/* 次のステージボタン */}
            {readyForNextStage && !showLevelUp && (
              <NextStageButton
                onNext={handleNextStage}
                isKeyboardVisible={isKeyboardVisible}
              />
            )}
          </div>
        </div>}
    </CombatEffects>
  );
};

export default App;