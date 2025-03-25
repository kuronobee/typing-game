// src/hooks/useEffects.ts
import { useState } from 'react';
import { FireSkillEffectProps, SkillEffectProps } from '../handlers/SkillHandler';

export function useEffects() {
  // エフェクト関連の状態
  const [playerHitEffect, setPlayerHitEffect] = useState<boolean>(false);
  const [playerAttackEffect, setPlayerAttackEffect] = useState<boolean>(false);
  const [skillCallOut, setSkillCallOut] = useState<string | null>(null);
  const [skillEffect, setSkillEffect] = useState<{
    type: "heal" | "damage" | "buff" | "debuff";
    targetPosition?: { x: number; y: number };
    value?: number;
    skillName?: string;
  } | null>(null);
  const [fireSkillEffect, setFireSkillEffect] = useState<{
    skillName: string;
    targetPosition: { x: number; y: number };
    sourcePosition: { x: number; y: number };
    damageValue?: number;
    power: "low" | "medium" | "high";
    onComplete?: () => void;
  } | null>(null);
  
  // ダメージを受けたときのプレイヤーエフェクトを表示
  const showPlayerHitEffect = () => {
    setPlayerHitEffect(true);
    setTimeout(() => {
      setPlayerHitEffect(false);
    }, 600);
  };
  
  // プレイヤーの攻撃エフェクトを表示する関数
  const showPlayerAttackEffect = (isSkill: boolean = false) => {
    // アニメーションのクラス名を設定
    setPlayerAttackEffect(true);

    // アニメーション終了後にリセット
    setTimeout(() => {
      setPlayerAttackEffect(false);
    }, isSkill ? 700 : 500); // スキル使用時は少し長めのアニメーション
  };
  
  // コールアウトを表示する関数
  const showSkillCallOut = (skillName: string) => {
    setSkillCallOut(skillName);

    // 一定時間後に非表示にする
    setTimeout(() => {
      setSkillCallOut(null);
    }, 1500);
  };
  
  // スキルエフェクトの表示処理
  const showSkillEffectAnimation = (props: SkillEffectProps) => {
    setSkillEffect(props);

    // スキル使用時のスクリーンエフェクト（オプション）
    if (props.type === "damage") {
      // ダメージスキルはスクリーンシェイク
      // 実際のコードではisScreenShake状態を更新
    } else if (props.type === "heal") {
      // 回復スキルは明るくフラッシュ
      document.body.classList.add("heal-flash");
      setTimeout(() => {
        document.body.classList.remove("heal-flash");
      }, 500);
    }
  };
  
  // 炎系スキルのエフェクトを表示する関数
  const showFireSkillEffect = (props: FireSkillEffectProps) => {
    setFireSkillEffect({
      ...props,
      onComplete: () => {
        // オリジナルのコールバックを保存
        const originalCallback = props.onComplete;

        // 元のコールバックがあれば実行
        if (originalCallback) {
          originalCallback();
        }

        // エフェクト表示をクリア
        setFireSkillEffect(null);
      }
    });
  };
  
  return {
    // 状態
    playerHitEffect,
    playerAttackEffect,
    skillCallOut,
    skillEffect, setSkillEffect,
    fireSkillEffect, setFireSkillEffect,
    
    // 関数
    showPlayerHitEffect,
    showPlayerAttackEffect,
    showSkillCallOut,
    showSkillEffectAnimation,  // 追加
    showFireSkillEffect        // 追加
  };
}