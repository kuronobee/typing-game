// src/App.tsx - GameContextを使用してリファクタリング (修正版)
import React, { useEffect, useRef } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import LevelUpNotifier from "./components/LevelUpNotifier";
import CombatEffects from "./components/CombatEffects";
import NextStageButton from "./components/NextStageButton";
import SkillManagement from "./components/SkillManagement";
import SkillEffect from "./components/SkillEffect";
import FireSkillEffect from "./components/FireSkillEffect";
import SkillAcquisitionNotification from "./components/SkillAcquisitionNotification";
import { Player as PlayerModel } from "./models/Player";

// カスタムフックのインポート
import useIOSScrollPrevention from "./hooks/useIOSScrollPrevention";
import { useEffects } from "./hooks/useEffects";
import { useSkillManagement } from "./hooks/useSkillManagement";
import { useCombatSystem } from "./hooks/useCombatSystem";
import { usePlayerAttack } from "./hooks/usePlayerAttack";
import { ENEMY_HIT_ANIMATION_DURATION } from "./data/constants";
import { SkillInstance } from "./models/Skill";
import { StageManager } from "./managers/StageManager";
import { ExperienceManager } from "./managers/ExperienceManager";

// GameContextのインポート
import { GameProvider, useGame } from "./contexts/GameContext";

/**
 * メインアプリケーションコンポーネント - GameProviderでラップ
 */
const App: React.FC = () => {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
};

/**
 * アプリケーションのメインコンテンツ部分
 * GameContextを使用してステートの操作を行う
 */
const AppContent: React.FC = () => {
  const inputRef = useRef<HTMLInputElement | null>(null);

  // カスタムフックの使用
  useIOSScrollPrevention(inputRef);

  // GameContextから状態を取得
  const {
    player,
    setPlayer,
    currentEnemies,
    targetIndex,
    setTargetIndex,
    currentQuestion,
    setCurrentQuestion,
    wrongAttempts,
    setWrongAttempts,
    message,
    setMessage,
    comboCount,
    setComboCount,
    readyForNextStage,
    setReadyForNextStage,
    expGain,
    isDead,
    setIsDead,
    showGameOver,
    setShowGameOver,
    isHintFullyRevealed,
    setIsHintFullyRevealed,
    levelUpQueue,
    levelCompletionCallbacksRef,
    setLevelUpQueue,
    currentShowingLevel,
    setCurrentShowingLevel,
    spawnNewStage,
    handleSelectTarget,
    handleContinueGame,
    checkStageCompletion,
  } = useGame();

  // 視覚効果管理フックを使用
  const effects = useEffects();

  // スキル管理フックを使用
  const skillManagement = useSkillManagement(setMessage);

  // 敵キャラクターのDOM要素への参照を保持するためのRef配列
  const enemyRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 敵の数が変わったときにRef配列を初期化
  useEffect(() => {
    enemyRefs.current = Array(currentEnemies.length).fill(null);
  }, [currentEnemies.length]);

  // AppContent コンポーネント内で、useEffectを追加してスキル獲得関数をExperienceManagerに登録
  useEffect(() => {
    // ExperienceManagerのLEVEL_SKILLSに基づいて既存のスキルをチェック
    ExperienceManager.LEVEL_SKILLS.forEach(levelSkill => {
      if (levelSkill.level <= player.level && !skillManagement.availableSkillIds.includes(levelSkill.skillId)) {
        console.log(`レベル${levelSkill.level}のスキル「${levelSkill.skillName}」を獲得状態に追加`);
        skillManagement.acquireNewSkill(levelSkill.skillId);
      }
    });

    // スキルリストをデバッグ表示
    console.log("現在利用可能なスキルリスト:", skillManagement.availableSkillIds);
  }, [player.level]);

  // プレイヤー要素のrefを作成
  const playerRef = useRef<HTMLDivElement | null>(null);

  // 戦闘システムフック
  const combat = useCombatSystem(
    player,
    setPlayer,
    currentEnemies,
    setMessage,
    effects.showPlayerHitEffect
  );

  // プレイヤー攻撃フック
  const playerAttack = usePlayerAttack(
    player,
    setComboCount,
    setWrongAttempts,
    setMessage,
    isHintFullyRevealed
  );

  // マウント時に入力フィールドにフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
  }, [spawnNewStage]);

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
  }, [targetIndex, currentEnemies, setCurrentQuestion]);

  // プレイヤーが敵を攻撃する処理
  const handlePlayerAttack = (input: string) => {
    if (!currentEnemies.length) return;

    const targetEnemy = currentEnemies[targetIndex];
    if (!targetEnemy || targetEnemy.defeated) return;

    if (!currentQuestion) {
      setCurrentQuestion(targetEnemy.getNextQuestion());
      return;
    }

    const trimmedInput = input.trim();

    // 問題の正解から<>タグを除去
    const cleanedAnswer = currentQuestion.answer.replace(/<|>/g, "");

    if (trimmedInput.toLowerCase() === cleanedAnswer.toLowerCase()) {
      // 正解の場合
      const newCombo = comboCount + 1;
      playerAttack.handleComboUpdate(newCombo);

      // アクティブなスキルがあれば実行
      if (skillManagement.activeSkill && skillManagement.activeSkill.activationTiming === "onCorrectAnswer") {
        console.log("アクティブスキル発動:", skillManagement.activeSkill.name);

        // スキル使用時のプレイヤーアニメーション
        effects.showPlayerAttackEffect(true);

        // スキルを実行
        handleSkillUse(skillManagement.activeSkill, targetIndex);

        // アクティブスキルをリセット
        skillManagement.setActiveSkill(null);
      } else {
        // 通常攻撃処理
        const { damage, specialMessage } =
          playerAttack.calculateEffectiveDamage(
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

        // 通常攻撃時のプレイヤーアニメーション
        effects.showPlayerAttackEffect(false);
      }

      setWrongAttempts(0);

      // 敵が倒されたかチェック
      if (targetEnemy.defeated) {
        playerAttack.setEnemyDefeatedMessage(targetEnemy.name);

        // 次のターゲットを探す
        const nextIndex = StageManager.findNextAliveEnemyIndex(
          targetIndex,
          currentEnemies
        );
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

      // アクティブスキルも解除
      skillManagement.setActiveSkill(null);
    }
  };

  // スキル使用時の処理関数
  // スキル使用時の処理関数 - 修正版
  const handleSkillUse = (skill: SkillInstance, targetIndex?: number) => {
    // すでにスキルアニメーション実行中なら処理しない
    if (skillManagement.skillAnimationInProgress) {
      return;
    }

    // スキルが使用可能かチェック
    if (!skill.canUse(player)) {
      setMessage({
        text: "MPが足りないか、クールダウン中です",
        sender: "system"
      });
      return;
    }

    // スキル使用時のプレイヤーアニメーション
    if (skill.activationTiming === 'onCommand') {
      effects.showPlayerAttackEffect(true);
      // スキル名を表示
      effects.showSkillCallOut(skill.name);
    }

    // スキルアニメーション開始フラグをセット
    skillManagement.setSkillAnimationInProgress(true);

    // MP消費処理を先に行う - MPの減少を確実に反映
    const updatedPlayer = new PlayerModel(
      player.hp,
      player.maxHP,
      player.mp - skill.mpCost, // MPを減らす
      player.maxMP,
      player.defense,
      player.magicDefense,
      player.level,
      player.exp,
      player.totalExp,
      player.speed,
      player.attack,
      player.luck,
      player.power,
      player.statusEffects
    );
    setPlayer(updatedPlayer);

    if (skill.type === 'heal') {
      // 回復スキルの例
      const result = skill.execute(updatedPlayer, currentEnemies);
      const healAmount = result.healAmount || 20;

      // エフェクト表示
      effects.showSkillEffectAnimation({
        type: 'heal',
        targetPosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 - 100 },
        value: healAmount,
        skillName: skill.name
      });

      // プレイヤーのHP回復処理 - MPはすでに消費済み
      setPlayer(prev => {
        const newHP = Math.min(prev.hp + healAmount, prev.maxHP);
        return new PlayerModel(
          newHP,
          prev.maxHP,
          prev.mp,
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
          prev.statusEffects
        );
      });

      // メッセージ表示
      setMessage({
        text: `${skill.name}を使用！ HPが${healAmount}回復した！`,
        sender: "player"
      });

      // アニメーション終了
      setTimeout(() => {
        skillManagement.setSkillAnimationInProgress(false);
      }, 1000);
    } else if (skill.type === 'damage' && targetIndex !== undefined) {
      // ダメージスキルの例
      const targetEnemy = currentEnemies[targetIndex];
      if (!targetEnemy || targetEnemy.defeated) {
        // ターゲットがいない場合はアニメーションフラグを解除して終了
        skillManagement.setSkillAnimationInProgress(false);
        return;
      }

      // ターゲットの位置を取得
      const enemyPosition = getEnemyPosition(targetIndex);
      // プレイヤーの位置を取得
      const playerPosition = getPlayerPosition();

      // スキル実行結果を取得 (正しくダメージを計算)
      const result = skill.execute(updatedPlayer, currentEnemies, targetIndex);
      const damageAmount = result.damageAmount || 0;

      // エフェクト表示 - z-indexを高く設定
      effects.showFireSkillEffect({
        skillName: skill.name,
        targetPosition: enemyPosition,
        sourcePosition: playerPosition,
        damageValue: damageAmount,
        power: "medium",
        onComplete: () => {
          // 安全な敵の状態更新 - 直接配列を変更しないよう注意
          const updatedEnemies = [...currentEnemies];
          updatedEnemies[targetIndex].takeDamage(damageAmount);

          // ダメージ表示
          combat.setDamageDisplay(targetIndex, damageAmount);
          combat.setHitFlag(targetIndex, ENEMY_HIT_ANIMATION_DURATION);

          // メッセージ表示
          setMessage({
            text: `${targetEnemy.name}に${skill.name}で${damageAmount}のダメージ！`,
            sender: "player"
          });

          // 敵撃破チェック
          if (targetEnemy.defeated) {
            playerAttack.setEnemyDefeatedMessage(targetEnemy.name);

            // 次のターゲットを探す
            const nextIndex = StageManager.findNextAliveEnemyIndex(
              targetIndex,
              currentEnemies
            );

            if (nextIndex !== -1) {
              // 次のターゲットにフォーカスを移す
              setTargetIndex(nextIndex);

              // 新しいターゲットの問題文を設定
              setTimeout(() => {
                const nextEnemy = currentEnemies[nextIndex];
                if (nextEnemy && !nextEnemy.defeated) {
                  setCurrentQuestion(nextEnemy.getNextQuestion());
                }
              }, 100);
            }

            // ステージクリア判定
            checkStageCompletion();
          }

          // アニメーション終了フラグをセット
          skillManagement.setSkillAnimationInProgress(false);
        }
      });
    }
  };
  // 次のステージへ進むハンドラ
  const handleNextStage = () => {
    spawnNewStage();
    setReadyForNextStage(false);
  };

  // レベルアップ表示を閉じる処理 - コールバック対応版
  const handleCloseLevelUp = () => {
    try {
      console.log("レベルアップ表示を閉じる処理を開始");

      // キューから次のレベルを処理
      const callback = levelCompletionCallbacksRef.current.shift();
      if (callback) {
        // コールバック実行（次のレベルやスキル獲得処理を行う）
        console.log("次のレベル処理用コールバックを実行");
        callback();
      }

      // 現在のレベル表示をクリア
      setCurrentShowingLevel(null);

      // キューから次のレベルを取り出す
      setLevelUpQueue(prev => {
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
      setCurrentShowingLevel(null);
      setLevelUpQueue([]);
      levelCompletionCallbacksRef.current = [];
    }
  };

  // プレイヤーが死亡したらゲームオーバー画面を表示(戦闘不能になってから5秒後)
  useEffect(() => {
    if (player.hp <= 0) {
      setIsDead(true);
      setTimeout(() => {
        setShowGameOver(true);
        setIsDead(false);
      }, 5000);
    }
  }, [player.hp, setIsDead, setShowGameOver]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // ファンクションキー（F1〜F3）でスキル選択を処理
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

      // Tab、Shift+Tab、Enterの元の機能も維持
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
  }, [readyForNextStage, currentEnemies, skillManagement, setTargetIndex]);

  const getPlayerPosition = (): { x: number, y: number } => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2
      };
    }

    // プレイヤー要素が見つからない場合のデフォルト位置
    return {
      x: window.innerWidth / 2,
      y: window.innerHeight - 150
    };
  };
  const getEnemyPosition = (targetIndex: number): { x: number, y: number } => {
    // 敵要素のRefを取得
    const enemyElement = enemyRefs.current[targetIndex];

    // デフォルト位置（enemyRefsが利用できない場合のフォールバック）
    const defaultPosition = {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2 - 140,
    };

    if (!enemyElement) {
      return defaultPosition;
    }

    // DOMの位置を取得
    const rect = enemyElement.getBoundingClientRect();

    // 敵キャラクターの中央の座標を計算
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
  };

  return (
    <CombatEffects
      isScreenHit={combat.isScreenHit}
      isScreenShake={combat.isScreenShake}
    >
      {/* 戦闘不能状態の表示 */}
      {isDead && (
        <div className="absolute inset-0 bg-black opacity-70 z-100 flex items-center justify-center">
          <span className="text-white font-bold text-xl">戦闘不能…</span>
        </div>
      )}

      {/* ゲームオーバー画面 */}
      {showGameOver && (
        <GameOver
          totalEXP={player.totalExp}
          onContinue={handleContinueGame}
        />
      )}

      {/* ファイヤースキル発動 - z-indexを高くして修正 */}
      {effects.fireSkillEffect && (
        <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1000 }}>
          <FireSkillEffect
            skillName={effects.fireSkillEffect.skillName}
            targetPosition={effects.fireSkillEffect.targetPosition}
            sourcePosition={effects.fireSkillEffect.sourcePosition}
            damageValue={effects.fireSkillEffect.damageValue}
            power={effects.fireSkillEffect.power}
            onComplete={() => {
              if (effects.fireSkillEffect?.onComplete) {
                effects.fireSkillEffect.onComplete();
              }
              effects.setFireSkillEffect(null);
            }}
            duration={1500}
          />
        </div>
      )}
      {/* メインゲーム画面 */}
      {!showGameOver && (
        <div className="bg-black">
          {/* スキル管理画面 (モーダル) */}
          {skillManagement.showSkillManagement && (
            <SkillManagement
              equippedSkills={skillManagement.equippedSkills}
              onEquipSkill={skillManagement.handleEquipSkill}
              onUnequipSkill={skillManagement.handleUnequipSkill}
              playerLevel={player.level}
              onClose={() => skillManagement.setShowSkillManagement(false)}
              availableSkillIds={skillManagement.availableSkillIds}
            />
          )}

          {/* スキルエフェクト - 一般 */}
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
          <div className="flex-1 bg-gray-900 transition-all duration-300">
            <BattleInterface
              player={player}
              onSubmit={handlePlayerAttack}
              onSkillUse={handleSkillUse}
              expGain={expGain}
              inputRef={inputRef}
              currentEnemies={currentEnemies}
              targetIndex={targetIndex}
              equippedSkills={skillManagement.equippedSkills}
              setEquippedSkills={skillManagement.setEquippedSkills}
              onOpenSkillManagement={() => skillManagement.setShowSkillManagement(true)}
              setActiveSkill={skillManagement.setActiveSkill}
              activeKeyIndex={skillManagement.activeKeyIndex}
            />
          </div>

          {/* BattleStage - 下部に配置 */}
          <div className="relative overflow-hidden" style={{ minHeight: '400px' }}>
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
              inputRef={inputRef}
              playerHitEffect={effects.playerHitEffect}
              playerDamageDisplay={combat.playerDamageDisplay}
              expGain={expGain}
              playerAttackEffect={effects.playerAttackEffect}
              enemyRefs={enemyRefs}
              skillAnimationInProgress={skillManagement.skillAnimationInProgress}
              skillCallOut={effects.skillCallOut}
              specialAttackTypes={combat.specialAttackTypes}
              criticalHits={combat.criticalHits}
              playerReff={playerRef}
            />

            {/* 通知系UI - レベルアップ */}
            {currentShowingLevel !== null && (
              <LevelUpNotifier
                player={player}
                level={currentShowingLevel}
                onClose={handleCloseLevelUp}
              />
            )}

            {/* 通知系UI - スキル獲得 */}
            {skillManagement.newlyAcquiredSkill && (
              <SkillAcquisitionNotification
                skill={skillManagement.newlyAcquiredSkill}
                onClose={skillManagement.handleCloseSkillNotification}
              />
            )}

            {/* 次のステージボタン */}
            {readyForNextStage && levelUpQueue.length === 0 && (
              <NextStageButton onNext={handleNextStage} />
            )}
          </div>
        </div>
      )}
    </CombatEffects>
  );
};

export default App;