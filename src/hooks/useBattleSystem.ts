// src/hooks/useBattleSystem.ts
import { useState, useCallback, useEffect } from 'react';
import { Question } from '../data/questions';
import { useCombatSystem } from './useCombatSystem';
import { usePlayerAttack } from './usePlayerAttack';
import { StageManager } from '../managers/StageManager';
import { useBattle } from '../context/BattleContext';
import { SkillHandler } from '../handlers/SkillHandler';
import { commonQuestions } from '../data/questions';
import { ENEMY_HIT_ANIMATION_DURATION } from '../data/constants';

// エクスポートをdefaultに変更


/**
 * 戦闘システム全体を管理するカスタムフック
 */
const useBattleSystem = () => {
  // バトルコンテキストから必要な状態とメソッドを取得
  const {
    player,
    setPlayer,
    currentEnemies,
    setCurrentEnemies,
    targetIndex,
    setTargetIndex,
    currentQuestion,
    setCurrentQuestion,
    wrongAttempts,
    setWrongAttempts,
    isHintFullyRevealed,
    comboCount,
    setComboCount,
    message,
    setMessage,
    enemyRefs,
    playerRef,
    showPlayerHitEffect,
    checkStageCompletion,
    skillAnimationInProgress,
    setSkillAnimationInProgress,
    showSkillCallOut,
    activeSkill,
    setActiveSkill,
    showPlayerAttackEffect,
  } = useBattle();

  // スキルハンドラーの状態
  const [skillHandler, setSkillHandler] = useState<SkillHandler | null>(null);

  // 戦闘システムフック
  const combat = useCombatSystem(player, setPlayer, currentEnemies, setMessage, showPlayerHitEffect);

  // プレイヤー攻撃フック
  const playerAttack = usePlayerAttack(
    player,
    setComboCount,
    setWrongAttempts,
    setMessage,
    isHintFullyRevealed
  );

  // プレイヤーの参照を更新
  useEffect(() => {
    combat.updatePlayerRef();
  }, [player, combat.updatePlayerRef]);

  // 敵が変わったときにアニメーション配列を初期化
  useEffect(() => {
    combat.initializeAnimations();
  }, [currentEnemies, combat.initializeAnimations]);

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

  // スキルハンドラーの初期化と更新
  useEffect(() => {
    if (!skillHandler) {
      const handler = new SkillHandler(
        player,
        currentEnemies,
        setPlayer,
        setMessage,
        combat.setDamageDisplay,
        combat.setHitFlag,
        () => {}, // ShowSkillEffect - 実装時に適切な関数に置き換え
        () => {}, // ShowFireSkillEffect - 実装時に適切な関数に置き換え
        checkStageCompletion,
        playerAttack.setEnemyDefeatedMessage,
        StageManager.findNextAliveEnemyIndex,
        setTargetIndex,
        setActiveSkill,
        showPlayerAttackEffect,
        enemyRefs,
        setSkillAnimationInProgress,
        showSkillCallOut,
        playerRef,
      );
      setSkillHandler(handler);
    } else {
      skillHandler.updateState(player, currentEnemies);
    }
  }, [player, currentEnemies, setPlayer, setMessage, combat.setDamageDisplay, 
      combat.setHitFlag, checkStageCompletion, playerAttack.setEnemyDefeatedMessage, 
      setTargetIndex, setActiveSkill, showPlayerAttackEffect, enemyRefs, 
      setSkillAnimationInProgress, showSkillCallOut, playerRef]);

  // プレイヤーが敵を攻撃する処理
  const handlePlayerAttack = useCallback((input: string) => {
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
      if (activeSkill && activeSkill.activationTiming === "onCorrectAnswer") {
        console.log("アクティブスキル発動:", activeSkill.name);

        // スキル使用時のプレイヤーアニメーション
        showPlayerAttackEffect(true);

        // スキルを実行
        handleSkillUse(activeSkill, targetIndex);

        // アクティブスキルをリセット
        setActiveSkill(null);
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
        showPlayerAttackEffect(false);
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
      setActiveSkill(null);
    }
  }, [
    currentEnemies, targetIndex, currentQuestion, comboCount, wrongAttempts,
    activeSkill, setCurrentQuestion, playerAttack, combat, 
    checkStageCompletion, setActiveSkill, setWrongAttempts, 
    showPlayerAttackEffect, setTargetIndex, setComboCount
  ]);

  // スキル使用処理関数
  const handleSkillUse = useCallback((skill: any, targetIndex?: number) => {
    if (skillHandler) {
      // スキル使用時のプレイヤーアニメーション
      if (skill.activationTiming === 'onCommand') {
        showPlayerAttackEffect(true);
        // スキル名を表示
        showSkillCallOut(skill.name);
      }

      skillHandler.handleSkillUse(skill, targetIndex);
    } else {
      setMessage({
        text: "スキルシステムの初期化中...",
        sender: "system",
      });
    }
  }, [skillHandler, showPlayerAttackEffect, showSkillCallOut, setMessage]);

  // ターゲット選択の処理
  const handleSelectTarget = useCallback((index: number) => {
    setTargetIndex(index);
  }, [setTargetIndex]);

  return {
    // 状態
    combat,
    playerAttack,
    skillHandler,
    
    // メソッド
    handlePlayerAttack,
    handleSkillUse,
    handleSelectTarget,
  };
};

// デフォルトエクスポートを追加
export default useBattleSystem;