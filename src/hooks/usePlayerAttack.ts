// src/hooks/usePlayerAttack.ts の修正版
import { useCallback } from "react";
import { Player as PlayerModel } from "../models/Player";
import { Enemy as EnemyModel } from "../models/EnemyModel";
import { Question } from "../data/questions";
import { MessageType } from "../components/MessageDisplay";

/**
 * プレイヤー攻撃のロジックを管理するカスタムフック
 */
export function usePlayerAttack(
  player: PlayerModel,
  setComboCount: React.Dispatch<React.SetStateAction<number>>,
  setWrongAttempts: React.Dispatch<React.SetStateAction<number>>,
  setMessage: React.Dispatch<React.SetStateAction<MessageType | null>>,
  isHintFullyRevealed: boolean
) {
  // プレイヤー攻撃の有効ダメージ計算
  const calculateEffectiveDamage = useCallback(
    (
      currentQuestion: Question,
      targetEnemy: EnemyModel,
      combo: number,
      wrongAttempts: number
    ) => {
      // 基本ダメージ計算
      const baseDamage = Math.max(5, player.attack - targetEnemy.defense);
      const randomFactor = 0.9 + Math.random() * 0.2;
      let damage = baseDamage * randomFactor;

      // ヒントペナルティ
      const answerNoSpaces = currentQuestion.answer.replace(/\s/g, "");
      const maxHints = answerNoSpaces.length;
      const effectiveWrongAttempts = isHintFullyRevealed
        ? maxHints
        : wrongAttempts;
      const hintFraction = effectiveWrongAttempts / maxHints;
      const multiplier = 1 - hintFraction / 2;
      damage *= multiplier;

      // ヒット/ミス/クリティカル計算のためのステータス
      const playerLuck = player.luck || 0;
      const playerPower = player.power || 0;
      const enemyLuck = targetEnemy.luck || 0;
      const enemySpeed = targetEnemy.speed || 0;

      // ミスとクリティカル確率の計算
      const missProbability = Math.min(
        0.01 + (enemyLuck + enemySpeed) * 0.005,
        0.1
      );
      const critProbability = Math.min(
        0.01 + (playerLuck + playerPower) * 0.005,
        0.15
      );

      // ヒントが完全に公開されている場合はクリティカルなし
      const effectiveCritProbability = isHintFullyRevealed
        ? 0
        : critProbability;

      const rand = Math.random();
      let specialMessage = "";

      // ミス判定
      if (rand < missProbability) {
        damage = 0;
        specialMessage = "ミス！";
      } else if (rand < missProbability + effectiveCritProbability) {
        // クリティカルヒット
        damage = Math.floor(player.attack * randomFactor * 1.5);
        specialMessage = "クリティカル！";
      } else {
        damage = Math.floor(damage);
      }

      // コンボダメージボーナス - 修正版
      // コンボ数に応じて1.1倍ずつダメージ増加、最大3倍まで
      if (combo <= 1) {
        // コンボ1は通常ダメージ（倍率なし）
        damage = Math.floor(damage);
      } else {
        // コンボ2以上は、(コンボ-1)回分だけ1.1倍する
        // Math.pow(1.1, combo-1) は 1.1の(combo-1)乗を計算
        const comboMultiplier = Math.min(Math.pow(1.1, combo - 1), 2.0);
        damage = Math.floor(damage * comboMultiplier);
      }

      // コンボが高いときのメッセージを追加
      if (combo >= 5) {
        specialMessage += ` 超コンボ！(x${combo})`;
      } else if (combo >= 3) {
        specialMessage += ` 大コンボ！(x${combo})`;
      } else if (combo === 2) {
        specialMessage += ` コンボ！(x${combo})`;
      }
      
      return { damage, effectiveWrongAttempts, multiplier, specialMessage };
    },
    [player, isHintFullyRevealed]
  );

  // コンボ処理
  const handleComboUpdate = useCallback(
    (newCombo: number) => {
      setComboCount(newCombo);
    },
    [setComboCount]
  );

  // 攻撃結果に基づくメッセージ設定
  const setAttackResultMessage = useCallback(
    (damage: number, specialMessage: string) => {
      if (damage === 0) {
        setMessage({
          text: "正解！しかし、攻撃を外してしまった！",
          sender: "player",
        });
      } else {
        setMessage({
          text: `正解！${specialMessage} ${damage} のダメージを与えた！`,
          sender: "player",
        });
      }
    },
    [setMessage]
  );

  // 敵撃破メッセージの設定
  const setEnemyDefeatedMessage = useCallback(
    (enemyName: string) => {
      setTimeout(() => {setMessage({
        text: `${enemyName} を倒した。`,
        sender: "system",
      })}, 100);
    },
    [setMessage]
  );
  // 不正解時のメッセージ設定
  const setWrongAnswerMessage = useCallback(() => {
    setComboCount(0);
    setWrongAttempts((prev) => prev + 1);
    setMessage({
      text: "間違い！正しい解答を入力してください！",
      sender: "system",
    });
  }, [setComboCount, setWrongAttempts, setMessage]);

  return {
    calculateEffectiveDamage,
    handleComboUpdate,
    setAttackResultMessage,
    setEnemyDefeatedMessage,
    setWrongAnswerMessage,
  };
}