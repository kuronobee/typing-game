// src/hooks/useGameScaling.ts
import { useState } from 'react';

/**
 * ゲーム内の画像スケーリングを管理するカスタムフック
 * 背景、モンスター、プレイヤーの画像サイズだけを調整し、UI要素はそのままにする
 */
export function useGameScaling() {
  // スケール設定の状態を管理
  const [scales, setScales] = useState({
    background: 0.3,  // 背景画像のスケール
    monster: 1.0,     // モンスター画像のスケール
    player: 1.0       // プレイヤー画像のスケール
  });

  // 背景画像のスタイルを生成する
  const getBackgroundStyle = () => {
    return {
      backgroundSize: scales.background === 1.0 ? 'cover' : `${scales.background * 100}%`,
      backgroundPosition: 'center bottom',
      transition: 'background-size 0.3s ease'
    };
  };

  // モンスター画像のスケール値を取得する
  const getMonsterScale = (baseScale: number) => {
    return baseScale * scales.monster;
  };

  // プレイヤー画像のスタイルを生成する
  const getPlayerStyle = () => {
    return {
      transform: `translateX(-50%) scale(${scales.player})`,
      transformOrigin: 'bottom center',
      transition: 'transform 0.3s ease'
    };
  };

  // スケール値を更新する関数
  const updateScales = (newScales: Partial<typeof scales>) => {
    setScales(prev => ({
      ...prev,
      ...newScales
    }));
  };

  // 個別のスケール値を更新する関数
  const updateBackgroundScale = (scale: number) => {
    setScales(prev => ({ ...prev, background: scale }));
  };

  const updateMonsterScale = (scale: number) => {
    setScales(prev => ({ ...prev, monster: scale }));
  };

  const updatePlayerScale = (scale: number) => {
    setScales(prev => ({ ...prev, player: scale }));
  };

  // すべてのスケール値を一度にリセットする関数
  const resetScales = () => {
    setScales({
      background: 1.0,
      monster: 1.0,
      player: 1.0
    });
  };

  return {
    scales,
    getBackgroundStyle,
    getMonsterScale,
    getPlayerStyle,
    updateScales,
    updateBackgroundScale,
    updateMonsterScale,
    updatePlayerScale,
    resetScales
  };
}