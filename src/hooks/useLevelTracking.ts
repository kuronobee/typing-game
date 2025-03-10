// src/hooks/useLevelTracking.ts
import { useState, useEffect, useRef } from 'react';
import { Player as PlayerModel } from "../models/Player";

/**
 * プレイヤーのレベルアップを追跡するカスタムフック
 * @param player プレイヤーインスタンス
 * @returns レベルアップ表示状態と状態を更新する関数
 */
export function useLevelTracking(player: PlayerModel) {
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(player.level);

  // レベルアップ通知のためのレベル変更の追跡
  useEffect(() => {
    if (player.level > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = player.level;
  }, [player.level]);

  return {
    showLevelUp,
    setShowLevelUp
  };
}