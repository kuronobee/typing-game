// src/managers/SkillEffectsManager.ts
import { FireSkillEffectProps, SkillEffectProps } from "../handlers/SkillHandler";

/**
 * スキルエフェクトの表示を管理するマネージャークラス
 */
export class SkillEffectsManager {
  /**
   * 回復系スキルのエフェクト設定
   * @param amount 回復量
   * @param targetPosition 対象の位置
   * @param skillName スキル名
   */
  static createHealEffect(
    amount: number,
    targetPosition: { x: number; y: number },
    skillName: string
  ): SkillEffectProps {
    return {
      type: "heal",
      targetPosition,
      value: amount,
      skillName,
    };
  }

  /**
   * ダメージ系スキルのエフェクト設定
   * @param amount ダメージ量
   * @param targetPosition 対象の位置
   * @param skillName スキル名
   */
  static createDamageEffect(
    amount: number,
    targetPosition: { x: number; y: number },
    skillName: string
  ): SkillEffectProps {
    return {
      type: "damage",
      targetPosition,
      value: amount,
      skillName,
    };
  }

  /**
   * バフ系スキルのエフェクト設定
   * @param targetPosition 対象の位置
   * @param skillName スキル名
   */
  static createBuffEffect(
    targetPosition: { x: number; y: number },
    skillName: string
  ): SkillEffectProps {
    return {
      type: "buff",
      targetPosition,
      skillName,
    };
  }

  /**
   * デバフ系スキルのエフェクト設定
   * @param targetPosition 対象の位置
   * @param skillName スキル名
   */
  static createDebuffEffect(
    targetPosition: { x: number; y: number },
    skillName: string
  ): SkillEffectProps {
    return {
      type: "debuff",
      targetPosition,
      skillName,
    };
  }

  /**
   * 火炎系スキルのエフェクト設定（ファイアボルト）
   * @param sourcePosition 発射位置
   * @param targetPosition 対象位置
   * @param damageValue ダメージ量
   * @param onComplete 完了時のコールバック
   */
  static createFireBoltEffect(
    sourcePosition: { x: number; y: number },
    targetPosition: { x: number; y: number },
    damageValue: number,
    onComplete?: () => void
  ): FireSkillEffectProps {
    return {
      skillName: "ファイアボルト",
      sourcePosition,
      targetPosition,
      damageValue,
      power: "low",
      onComplete,
    };
  }

  /**
   * 火炎系スキルのエフェクト設定（ファイアボール）
   * @param sourcePosition 発射位置
   * @param targetPosition 対象位置
   * @param damageValue ダメージ量
   * @param onComplete 完了時のコールバック
   */
  static createFireBallEffect(
    sourcePosition: { x: number; y: number },
    targetPosition: { x: number; y: number },
    damageValue: number,
    onComplete?: () => void
  ): FireSkillEffectProps {
    return {
      skillName: "ファイアボール",
      sourcePosition,
      targetPosition,
      damageValue,
      power: "medium",
      onComplete,
    };
  }

  /**
   * 火炎系スキルのエフェクト設定（ファイアストーム）
   * @param sourcePosition 発射位置
   * @param targetPosition 対象位置
   * @param damageValue ダメージ量
   * @param onComplete 完了時のコールバック
   */
  static createFireStormEffect(
    sourcePosition: { x: number; y: number },
    targetPosition: { x: number; y: number },
    damageValue: number,
    onComplete?: () => void
  ): FireSkillEffectProps {
    return {
      skillName: "ファイアストーム",
      sourcePosition,
      targetPosition,
      damageValue,
      power: "high",
      onComplete,
    };
  }

  /**
   * 画面エフェクトの表示処理
   * @param type エフェクトの種類
   * @param duration 表示時間（ミリ秒）
   */
  static showScreenEffect(type: "shake" | "flash" | "heal" | "fire", duration: number = 500): void {
    switch (type) {
      case "shake":
        document.body.classList.add("screen-shake");
        setTimeout(() => {
          document.body.classList.remove("screen-shake");
        }, duration);
        break;
      case "flash":
        document.body.classList.add("screen-flash-shake");
        setTimeout(() => {
          document.body.classList.remove("screen-flash-shake");
        }, duration);
        break;
      case "heal":
        document.body.classList.add("heal-flash");
        setTimeout(() => {
          document.body.classList.remove("heal-flash");
        }, duration);
        break;
      case "fire":
        document.body.classList.add("fire-skill-flash");
        setTimeout(() => {
          document.body.classList.remove("fire-skill-flash");
        }, duration);
        break;
    }
  }
}