// src/hooks/useCombatSystem.ts
import { useState, useRef, useCallback } from 'react';
import { Player as PlayerModel, StatusEffect } from "../models/Player";
import { Enemy as EnemyModel } from "../models/EnemyModel";
import { MessageType } from "../components/MessageDisplay";
import {
  PLAYER_HIT_ANIMATION_DURATION,
  PLAYER_FIREBREATH_ANIMATION_DURATION,
} from "../data/constants";

type DamageDisplay = { value: number; id: number };

/**
 * 戦闘システムを管理するカスタムフック
 */
export function useCombatSystem(
  player: PlayerModel, 
  setPlayer: React.Dispatch<React.SetStateAction<PlayerModel>>,
  currentEnemies: EnemyModel[],
  setMessage: React.Dispatch<React.SetStateAction<MessageType | null>>
) {
  // 視覚効果の状態
  const [isScreenHit, setIsScreenHit] = useState<boolean>(false);
  const [isScreenShake, setIsScreenShake] = useState<boolean>(false);
  const [enemyAttackFlags, setEnemyAttackFlags] = useState<boolean[]>([]);
  const [enemyFireFlags, setEnemyFireFlags] = useState<boolean[]>([]);
  const [enemyHitFlags, setEnemyHitFlags] = useState<boolean[]>([]);
  const [damageNumbers, setDamageNumbers] = useState<(DamageDisplay | null)[]>([]);
  
  // プレイヤーの最新情報を保持するためのref
  const playerRef = useRef(player);
  
  // 毒の場合は毒タイマー
  const poisonTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 敵が変わったときにダメージ表示配列を初期化
  const initializeAnimations = useCallback(() => {
    setDamageNumbers(currentEnemies.map(() => null));
    setEnemyAttackFlags(currentEnemies.map(() => false));
    setEnemyFireFlags(currentEnemies.map(() => false));
    setEnemyHitFlags(currentEnemies.map(() => false));
  }, [currentEnemies]);

  // 毒状態効果の処理
  const handlePoisonAttack = useCallback((poisonEffect: StatusEffect) => {
    if (poisonTimerRef.current !== null) {
      return;
    }

    // 毎秒毒ダメージを与えるためのインターバル設定
    poisonTimerRef.current = setInterval(() => {
      setPlayer((prev) => prev.takeDamage(poisonEffect.damagePerTick));
    }, 1000);

    // 指定された期間後に毒効果をクリア
    setTimeout(() => {
      if (poisonTimerRef.current) {
        clearInterval(poisonTimerRef.current);
        setPlayer((prev) => prev.removeStatusEffects("poison"));
        poisonTimerRef.current = null;
      }
    }, poisonEffect.ticks * 1000);
  }, [setPlayer]);

  // 敵の攻撃アニメーションをトリガー
  const triggerEnemyAttackAnimation = useCallback((
    setFunction: React.Dispatch<React.SetStateAction<boolean[]>>,
    attackingEnemy: EnemyModel,
    duration: number
  ) => {
    const index = currentEnemies.findIndex((e) => e === attackingEnemy);
    
    setFunction((prev) => {
      const newFlags = [...prev];
      newFlags[index] = true;
      return newFlags;
    });
    
    setTimeout(() => {
      setFunction((prev) => {
        const newFlags = [...prev];
        newFlags[index] = false;
        return newFlags;
      });
    }, duration);
  }, [currentEnemies]);

  // 敵がプレイヤーを攻撃する処理
  const handleEnemyAttack = useCallback(
    (attackingEnemy: EnemyModel) => {
      if (attackingEnemy === undefined || attackingEnemy.currentHP <= 0) return;

      // 再レンダリングを避けるためにplayerRefを使用
      const attack = attackingEnemy.performAttack(playerRef.current);
      let damageToApply: number;
      let specialMessage = "";
      let isCritical = false;

      // 特殊攻撃の処理
      if (attack.special) {
        setPlayer((prev) =>
          prev.applyStatusEffects(attack.result.statusEffects)
        );
        
        // 毒効果の処理
        const poisonEffect = attack.result.statusEffects.find(
          (e) => e.type === "poison"
        );
        if (poisonEffect) {
          handlePoisonAttack(poisonEffect);
        }
        
        // 炎の息の処理
        if (attack.special === "fire breath") {
          triggerEnemyAttackAnimation(
            setEnemyFireFlags,
            attackingEnemy,
            PLAYER_FIREBREATH_ANIMATION_DURATION
          );
        }
        
        specialMessage = `${attack.result.message}`;
        damageToApply = attack.result.damage;
        
        const effect_message = `${specialMessage}`;
        const damage_message =
          damageToApply !== 0 ? `${damageToApply}のダメージ！` : "";
        setMessage({ text: effect_message + damage_message, sender: "enemy" });
      } else {
        // 通常攻撃
        triggerEnemyAttackAnimation(
          setEnemyAttackFlags,
          attackingEnemy,
          PLAYER_HIT_ANIMATION_DURATION
        );
        
        damageToApply = attack.result.damage;

        // クリティカルヒット判定
        const baseCritRate = 0.05;
        const luckBonus = (attackingEnemy.luck || 0) * 0.01;
        const criticalRate = baseCritRate + luckBonus;

        if (Math.random() < criticalRate) {
          isCritical = true;
          const randomFactor = 0.9 + Math.random() * 0.2;
          const baseDamage = attackingEnemy.attackPower * 1.5;
          damageToApply = Math.floor(baseDamage * randomFactor);

          let damageDescription = "";
          if (randomFactor > 1.05) {
            damageDescription = "会心の一撃！";
          } else if (randomFactor < 0.95) {
            damageDescription = "かすり傷！";
          }

          setMessage({
            text: `${attackingEnemy.name} のクリティカル攻撃！${damageDescription} 防御を無視した ${damageToApply} のダメージ！`,
            sender: "enemy",
          });
        } else {
          setMessage({
            text: `${attackingEnemy.name} の攻撃！ ${damageToApply} のダメージ！`,
            sender: "enemy",
          });
        }
      }
      
      // プレイヤーにダメージを適用
      setPlayer((prev) => prev.takeDamage(damageToApply));

      // 攻撃タイプに応じた画面エフェクトを適用
      if (damageToApply > 0) {
        if (isCritical) {
          setIsScreenHit(true);
          setTimeout(() => {
            setIsScreenHit(false);
          }, 500);
        } else {
          setIsScreenShake(true);
          setTimeout(() => {
            setIsScreenShake(false);
          }, 500);
        }
      }
    },
    [currentEnemies, playerRef, setPlayer, setMessage, handlePoisonAttack, triggerEnemyAttackAnimation]
  );

  // プレイヤーの参照を更新
  const updatePlayerRef = useCallback(() => {
    playerRef.current = player;
  }, [player]);

  // ダメージ表示の設定
  const setDamageDisplay = useCallback((targetIndex: number, damage: number) => {
    const newDamage: DamageDisplay = { value: damage, id: Date.now() };
    
    setDamageNumbers((prev) => {
      const newArr = [...prev];
      newArr[targetIndex] = newDamage;
      return newArr;
    });
    
    setTimeout(() => {
      setDamageNumbers((prev) => {
        const newArr = [...prev];
        newArr[targetIndex] = null;
        return newArr;
      });
    }, 1000);
  }, []);

  // ヒットフラグの設定
  const setHitFlag = useCallback((targetIndex: number, duration: number) => {
    setEnemyHitFlags((prev) => {
      const newFlags = [...prev];
      newFlags[targetIndex] = true;
      return newFlags;
    });
    
    setTimeout(() => {
      setEnemyHitFlags((prev) => {
        const newFlags = [...prev];
        newFlags[targetIndex] = false;
        return newFlags;
      });
    }, duration);
  }, []);

  return {
    // 状態
    isScreenHit,
    isScreenShake,
    enemyAttackFlags,
    enemyFireFlags,
    enemyHitFlags,
    damageNumbers,
    playerRef,
    
    // 関数
    initializeAnimations,
    handleEnemyAttack,
    updatePlayerRef,
    setDamageDisplay,
    setHitFlag
  };
}