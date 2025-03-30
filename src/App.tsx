// src/App.tsx - useGameState, useEffects, useSkillManagementフックを適用
import React, { useEffect, useRef, useState } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import LevelUpNotifier from "./components/LevelUpNotifier";
import CombatEffects from "./components/CombatEffects";
import NextStageButton from "./components/NextStageButton";

import { Player as PlayerModel } from "./models/Player";
import { ENEMY_HIT_ANIMATION_DURATION } from "./data/constants";

// カスタムフックのインポート
import useIOSScrollPrevention from "./hooks/useIOSScrollPrevention";
import { useCombatSystem } from "./hooks/useCombatSystem";
import { usePlayerAttack } from "./hooks/usePlayerAttack";
import { useGameState } from "./hooks/useGameState"; // ゲーム状態管理フック
import { useEffects } from "./hooks/useEffects"; // 視覚効果管理フック
import { useSkillManagement } from "./hooks/useSkillManagement"; // スキル管理フック

// マネージャークラスのインポート
import { StageManager } from "./managers/StageManager";
import { ExperienceManager } from "./managers/ExperienceManager";

// インポート
import SkillManagement from "./components/SkillManagement";
import { SkillInstance } from "./models/Skill";
import SkillEffect from "./components/SkillEffect";
import FireSkillEffect from "./components/FireSkillEffect";
import { SkillHandler } from "./handlers/SkillHandler";
import SkillAcquisitionNotification from "./components/SkillAcquisitionNotification";

const App: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // カスタムフックの使用
  useIOSScrollPrevention(inputRef);

  // ゲーム状態管理フックを使用
  const gameState = useGameState();
  
  // 視覚効果管理フックを使用
  const effects = useEffects();

  // スキル管理フックを使用
  const skillManagement = useSkillManagement(gameState.setMessage);

  // マウント時に入力フィールドにフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 敵キャラクターのDOM要素への参照を保持するためのRef配列
  const enemyRefs = useRef<(HTMLDivElement | null)[]>([]);
  // 敵の数が変わったときにRef配列を初期化
  useEffect(() => {
    // 配列のサイズを現在の敵の数に合わせる
    enemyRefs.current = Array(gameState.currentEnemies.length).fill(null);
  }, [gameState.currentEnemies.length]);
  // プレイヤー要素のrefを作成
  const playerRef = useRef<HTMLDivElement | null>(null);

  // スキルハンドラの状態を管理
  const [skillHandler, setSkillHandler] = useState<SkillHandler | null>(null);

  // 戦闘システムフック
  const combat = useCombatSystem(
    gameState.player, 
    gameState.setPlayer, 
    gameState.currentEnemies, 
    gameState.setMessage, 
    effects.showPlayerHitEffect
  );

  // プレイヤー更新時のrefを更新
  useEffect(() => {
    combat.updatePlayerRef();
  }, [gameState.player, combat.updatePlayerRef]);

  // 敵が変わったときにアニメーション配列を初期化
  useEffect(() => {
    combat.initializeAnimations();
  }, [gameState.currentEnemies, combat.initializeAnimations]);

  useEffect(() => {
    if (!skillHandler) {
      const handler = new SkillHandler(
        gameState.player,
        gameState.currentEnemies,
        gameState.setPlayer,
        gameState.setMessage,
        combat.setDamageDisplay,
        combat.setHitFlag,
        effects.showSkillEffectAnimation,
        effects.showFireSkillEffect,
        checkStageCompletion,
        playerAttack.setEnemyDefeatedMessage,
        StageManager.findNextAliveEnemyIndex,
        gameState.setTargetIndex,
        skillManagement.setActiveSkill,
        effects.showPlayerAttackEffect,
        enemyRefs,
        skillManagement.setSkillAnimationInProgress,
        effects.showSkillCallOut,
        playerRef,
      );
      setSkillHandler(handler);
    }
    else {
      skillHandler.updateState(gameState.player, gameState.currentEnemies);
    }
  }, [gameState.player, gameState.currentEnemies, effects, skillManagement]);

  // マウント時に初期ステージを生成
  useEffect(() => {
    spawnNewStage();
  }, []);

  // ターゲットが変わったときに現在の問題を更新
  useEffect(() => {
    if (gameState.currentEnemies.length > 0) {
      const targetEnemy = gameState.currentEnemies[gameState.targetIndex];
      if (targetEnemy && !targetEnemy.defeated) {
        gameState.setCurrentQuestion(
          targetEnemy.presentedQuestion || targetEnemy.getNextQuestion()
        );
      }
    }
  }, [gameState.targetIndex, gameState.currentEnemies]);

  // プレイヤー攻撃フック
  const playerAttack = usePlayerAttack(
    gameState.player,
    gameState.setComboCount,
    gameState.setWrongAttempts,
    gameState.setMessage,
    gameState.isHintFullyRevealed
  );

  // タブによるターゲット選択とステージ進行のためのキーダウンイベント処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Shift+Tabで反時計回りにターゲット選択
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        if (gameState.currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          gameState.setTargetIndex((prev) => {
            const findPrevAliveIndex = (index: number): number => {
              let newIndex = index - 1;
              if (newIndex < 0) {
                newIndex = gameState.currentEnemies.length - 1;
              }
              if (gameState.currentEnemies[newIndex].defeated) {
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
        if (gameState.currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          gameState.setTargetIndex((prev) => {
            const findNextAliveIndex = (index: number): number => {
              const newIndex = (index + 1) % gameState.currentEnemies.length;
              if (newIndex === index) return index;
              if (gameState.currentEnemies[newIndex].defeated) {
                return findNextAliveIndex(newIndex);
              }
              return newIndex;
            };
            return findNextAliveIndex(prev);
          });
        }
      }
      // Enterで次のステージへ進む
      else if (event.key === "Enter" && gameState.readyForNextStage) {
        spawnNewStage();
        gameState.setReadyForNextStage(false);
      }
      // ファンクションキー（F1〜F3）でスキル選択を追加
      if (event.key.startsWith('F') && !isNaN(parseInt(event.key.slice(1)))) {
        const keyNum = parseInt(event.key.slice(1));
        if (keyNum >= 1 && keyNum <= 3) {
          // ブラウザのデフォルト動作を防止
          event.preventDefault();

          // F1-F3のキーコードからインデックスを取得（0-2）
          const skillIndex = keyNum - 1;

          // アクティブキーインデックスを設定
          skillManagement.setActiveKeyIndex(skillIndex);

          // 短い遅延後にリセット（視覚効果のため）
          setTimeout(() => {
            skillManagement.setActiveKeyIndex(null);
          }, 200);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameState.readyForNextStage, gameState.currentEnemies, skillManagement]);

  // アンマウント時にタイムアウトをクリア
  const questionTimeoutRef = useRef<number | null>(null);
  useEffect(() => {
    return () => {
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    };
  }, []);

  // プレイヤーが敵を攻撃する処理
  // プレイヤーの攻撃処理を修正（アクティブスキルの処理を追加）
  const handlePlayerAttack = (input: string) => {
    if (!gameState.currentEnemies.length) return;

    const targetEnemy = gameState.currentEnemies[gameState.targetIndex];
    if (!targetEnemy || targetEnemy.defeated) return;

    if (!gameState.currentQuestion) {
      gameState.setCurrentQuestion(targetEnemy.getNextQuestion());
    }

    const trimmedInput = input.trim();

    // 問題の正解から<>タグを除去
    const cleanedAnswer = gameState.currentQuestion.answer.replace(/<|>/g, "");

    if (trimmedInput.toLowerCase() === cleanedAnswer.toLowerCase()) {
      // 正解の場合
      const newCombo = gameState.comboCount + 1;
      playerAttack.handleComboUpdate(newCombo);

      // アクティブなスキルがあれば実行
      if (skillManagement.activeSkill && skillManagement.activeSkill.activationTiming === "onCorrectAnswer") {
        console.log("アクティブスキル発動:", skillManagement.activeSkill.name);

        // スキル使用時のプレイヤーアニメーション
        effects.showPlayerAttackEffect(true);

        // スキルを実行
        handleSkillUse(skillManagement.activeSkill, gameState.targetIndex);

        // アクティブスキルをリセット
        skillManagement.setActiveSkill(null);
      } else {
        // 通常攻撃処理
        const { damage, specialMessage } =
          playerAttack.calculateEffectiveDamage(
            gameState.currentQuestion,
            targetEnemy,
            newCombo,
            gameState.wrongAttempts
          );
        targetEnemy.takeDamage(damage);

        // ダメージ表示とヒットアニメーション
        combat.setDamageDisplay(gameState.targetIndex, damage);
        combat.setHitFlag(gameState.targetIndex, ENEMY_HIT_ANIMATION_DURATION);

        // ダメージメッセージを設定
        playerAttack.setAttackResultMessage(damage, specialMessage);

        // 通常攻撃時のプレイヤーアニメーション
        effects.showPlayerAttackEffect(false);
      }

      gameState.setWrongAttempts(0);

      // 敵が倒されたかチェック
      if (targetEnemy.defeated) {
        playerAttack.setEnemyDefeatedMessage(targetEnemy.name);

        // 次のターゲットを探す
        const nextIndex = StageManager.findNextAliveEnemyIndex(
          gameState.targetIndex,
          gameState.currentEnemies
        );
        if (nextIndex !== -1) {
          gameState.setTargetIndex(nextIndex);
        }
      } else {
        // 次の問題を取得
        gameState.setCurrentQuestion(targetEnemy.getNextQuestion());
      }

      // ステージが完了したかチェック
      checkStageCompletion();
    } else {
      // 不正解の場合
      playerAttack.setWrongAnswerMessage();

      // アクティブスキルも解除
      skillManagement.setActiveSkill(null);
    }
  };

  // ステージクリア判定と経験値獲得の関数 - StageManagerを使用
  const checkStageCompletion = (enemies = gameState.currentEnemies) => {
    return StageManager.handleStageCompletion(
      enemies,
      gainEXP,
      gameState.setMessage,
      gameState.setReadyForNextStage
    );
  };

  // レベルアップ完了時のコールバックを保持するref
  const levelCompletionCallbacks = useRef<(() => void)[]>([]);

  // 経験値を付与する関数
  const gainEXP = (amount: number) => {
    // 入力検証（負の値や異常に大きな値を検出）
    if (amount <= 0 || amount > 10000) {
      console.error(`無効な経験値量: ${amount}`);
      return false;
    }

    console.log(`経験値を獲得: ${amount}`);

    try {
      // レベルアップ表示のコールバック関数
      const showLevelUpCallback = (level: number, callback: () => void) => {
        // ロギング
        console.log(`レベル ${level} の表示処理を開始`);

        // レベルの整合性チェック
        if (level <= 0 || level > 100) {
          console.error(`無効なレベル値: ${level}`);
          // エラー時は次のレベル処理へ
          callback();
          return;
        }

        // レベルアップキューに追加
        gameState.setLevelUpQueue(prev => [...prev, level]);

        // 表示用の状態変数を更新
        window.setTimeout(() => {
          // ロギング
          console.log(`レベル ${level} の通知を表示`);

          gameState.setCurrentShowingLevel(level);
          // このレベルのコールバック関数をキューに追加
          levelCompletionCallbacks.current.push(callback);
        }, 100);
      };

      // 前のレベルを記録
      const oldLevel = gameState.player.level;

      // ExperienceManager に改良した関数を渡す
      const didLevelUp = ExperienceManager.gainExperience(
        amount,
        gameState.player,
        gameState.setPlayer,
        gameState.setExpGain,
        skillManagement.acquireNewSkill,
        showLevelUpCallback
      );

      // レベルの整合性チェック（ステージ完了後）
      if (gameState.player.level < oldLevel) {
        console.error(`レベルダウン検出: ${oldLevel} → ${gameState.player.level}、修正します`);
        // 以前のレベルに戻す緊急修正
        gameState.setPlayer(prev => new PlayerModel(
          prev.hp,
          prev.maxHP,
          prev.mp,
          prev.maxMP,
          prev.defense,
          prev.magicDefense,
          oldLevel, // 元のレベルを維持
          prev.exp,
          prev.totalExp,
          prev.speed,
          prev.attack,
          prev.luck,
          prev.power,
          prev.statusEffects
        ));
      }

      // ステージ完了メッセージを設定
      gameState.setMessage(StageManager.createCompletionMessage(amount));

      return didLevelUp;
    } catch (error) {
      console.error('経験値獲得処理中にエラーが発生しました:', error);
      gameState.setMessage({
        text: "経験値獲得処理中にエラーが発生しました",
        sender: "system"
      });
      return false;
    }
  };

  // レベルアップ表示を閉じる処理
  const handleCloseLevelUp = () => {
    try {
      console.log("レベルアップ表示を閉じる処理を開始");

      // キューから次のレベルを処理
      const callback = levelCompletionCallbacks.current.shift();
      if (callback) {
        // コールバック実行（次のレベルやスキル獲得処理を行う）
        console.log("次のレベル処理用コールバックを実行");
        callback();
      }

      // 現在のレベル表示をクリア
      gameState.setCurrentShowingLevel(null);

      // キューから次のレベルを取り出す
      gameState.setLevelUpQueue(prev => {
        const newQueue = [...prev];
        if (newQueue.length > 0) {
          console.log(`レベルアップキューから削除: ${newQueue[0]}`);
          newQueue.shift();
        }
        return newQueue;
      });
    } catch (error) {
      console.error('レベルアップ表示処理中にエラー:', error);
      // エラー時は状態をリセット
      gameState.setCurrentShowingLevel(null);
      gameState.setLevelUpQueue([]);
      levelCompletionCallbacks.current = [];
    }
  };

  // 新しい戦闘ステージを生成
  const spawnNewStage = () => {
    const { enemies, message, scale } = StageManager.createNewStage();
    gameState.setStageScale(scale ?? 1);
    gameState.setCurrentEnemies(enemies);
    gameState.setTargetIndex(0);
    gameState.setMessage(message);
  };

  // ターゲット選択の処理
  const handleSelectTarget = (index: number) => {
    gameState.setTargetIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // スキル使用時の処理関数
  const handleSkillUse = (skill: SkillInstance, targetIndex?: number) => {
    if (skillHandler) {
      // スキル使用時のプレイヤーアニメーション
      if (skill.activationTiming === 'onCommand') {
        effects.showPlayerAttackEffect(true);
        // スキル名を表示
        effects.showSkillCallOut(skill.name);
      }

      skillHandler.handleSkillUse(skill, targetIndex);
    } else {
      gameState.setMessage({
        text: "スキルシステムの初期化中...",
        sender: "system",
      });
    }
  };

  // 死亡後のゲーム継続処理
  const handleContinueGame = () => {
    gameState.setIsDead(false);
    gameState.setShowGameOver(false);
    // プレイヤーを最大HPの半分で復活
    gameState.setPlayer((prev) => {
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

    gameState.setMessage({
      text: "力を取り戻した！戦いを続ける！",
      sender: "system",
    });

    // すべての敵が倒された場合は新しいステージを生成
    if (gameState.currentEnemies.every((enemy) => enemy.defeated)) {
      spawnNewStage();
    }
  };

  // 次のステージへ進むハンドラ
  const handleNextStage = () => {
    spawnNewStage();
    gameState.setReadyForNextStage(false);
  };

  // プレイヤーが死亡したらゲームオーバー画面を表示(戦闘不能になってから5秒後)
  useEffect(() => {
    if (gameState.player.hp <= 0) {
      gameState.setIsDead(true);
      setTimeout(() => {
        gameState.setShowGameOver(true);
        gameState.setIsDead(false);
      }, 5000);
    }
  }, [gameState.player.hp]);

  return (
    <CombatEffects
      isScreenHit={combat.isScreenHit}
      isScreenShake={combat.isScreenShake}
    >
      {gameState.isDead && (
        <div className="absolute inset-0 bg-black opacity-70 z-100 flex items-center justify-center">
          <span className="text-white font-bold text-xl">戦闘不能…</span>
        </div>
      )}

      {gameState.showGameOver && (
        <GameOver totalEXP={gameState.player.totalExp} onContinue={handleContinueGame} />
      )}
      {/* ファイヤースキル発動 */}
      {effects.fireSkillEffect && (
        <div className="z-500">
          <FireSkillEffect
            skillName={effects.fireSkillEffect.skillName}
            targetPosition={effects.fireSkillEffect.targetPosition}
            sourcePosition={effects.fireSkillEffect.sourcePosition} 
            damageValue={effects.fireSkillEffect.damageValue}
            power={effects.fireSkillEffect.power}
            onComplete={() => {
              // 保存されたコールバックがあれば実行
              if (effects.fireSkillEffect?.onComplete) {
                effects.fireSkillEffect.onComplete();
              }
              // エフェクト表示をクリア
              effects.setFireSkillEffect(null);
            }}
            duration={1500}
          />
        </div>
      )}
      {!gameState.showGameOver && (
        <div className="bg-black">
          {/* スキル管理画面 */}
          {skillManagement.showSkillManagement && (
            <SkillManagement
              equippedSkills={skillManagement.equippedSkills}
              onEquipSkill={skillManagement.handleEquipSkill}
              onUnequipSkill={skillManagement.handleUnequipSkill}
              playerLevel={gameState.player.level}
              onClose={() => skillManagement.setShowSkillManagement(false)}
              availableSkillIds={skillManagement.availableSkillIds}
            />
          )}

          {/* スキルエフェクト表示 */}
          {effects.skillEffect && (
            <SkillEffect
              type={effects.skillEffect.type}
              targetPosition={effects.skillEffect.targetPosition}
              value={effects.skillEffect.value}
              skillName={effects.skillEffect.skillName}
              onComplete={() => effects.setSkillEffect(null)}
              duration={1000}
            />
          )}

          {/* BattleInterface - 上部に配置 */}
          <div
            className="flex-1 bg-gray-900 transition-all duration-300"
          >
            <BattleInterface
              player={gameState.player}
              onSubmit={handlePlayerAttack}
              onSkillUse={handleSkillUse}
              expGain={gameState.expGain}
              inputRef={inputRef}
              currentEnemies={gameState.currentEnemies}
              targetIndex={gameState.targetIndex}
              equippedSkills={skillManagement.equippedSkills}
              setEquippedSkills={skillManagement.setEquippedSkills}
              onOpenSkillManagement={() => skillManagement.setShowSkillManagement(true)}
              setActiveSkill={skillManagement.setActiveSkill}
              activeKeyIndex={skillManagement.activeKeyIndex}
            />
          </div>

          {/* BattleStage - 下部に配置 (完全高さ指定) */}
          <div
            className="relative overflow-hidden"
            style={{
              minHeight: '400px' // 画面の高さに合わせる
            }}
          >
            <BattleStage
              currentEnemies={gameState.currentEnemies}
              targetIndex={gameState.targetIndex}
              player={gameState.player}
              onEnemyAttack={combat.handleEnemyAttack}
              message={gameState.message}
              currentQuestion={gameState.currentQuestion}
              wrongAttempts={gameState.wrongAttempts}
              enemyHitFlags={combat.enemyHitFlags}
              enemyAttackFlags={combat.enemyAttackFlags}
              enemyFireFlags={combat.enemyFireFlags}
              damageNumbers={combat.damageNumbers}
              onFullRevealChange={gameState.setIsHintFullyRevealed}
              onSelectTarget={handleSelectTarget}
              comboCount={gameState.comboCount}
              inputRef={inputRef}
              playerHitEffect={effects.playerHitEffect}
              playerDamageDisplay={combat.playerDamageDisplay}
              expGain={gameState.expGain}
              playerAttackEffect={effects.playerAttackEffect}
              enemyRefs={enemyRefs}
              skillAnimationInProgress={skillManagement.skillAnimationInProgress}
              skillCallOut={effects.skillCallOut}
              specialAttackTypes={combat.specialAttackTypes}
              criticalHits={combat.criticalHits}
              playerReff={playerRef}
              stageScale={gameState.stageScale ?? 1}
              scaleAnimationDuration={1500}
            />

            {/* レベルアップ通知 */}
            {gameState.currentShowingLevel !== null && (
              <LevelUpNotifier
                player={gameState.player}
                level={gameState.currentShowingLevel}
                onClose={handleCloseLevelUp}
              />
            )}            
            {/* スキル獲得通知 */}
            {skillManagement.newlyAcquiredSkill && (
              <SkillAcquisitionNotification
                skill={skillManagement.newlyAcquiredSkill}
                onClose={skillManagement.handleCloseSkillNotification}
              />
            )}
            {/* 次のステージボタン */}
            {gameState.readyForNextStage && gameState.levelUpQueue.length === 0 && (
              <NextStageButton
                onNext={handleNextStage}
              />
            )}
          </div>
        </div>
      )}
    </CombatEffects>
  );
};

export default App;