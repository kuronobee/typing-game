// src/hooks/useGameHandlers.ts を新規作成

import { useCallback } from 'react';
import { Player as PlayerModel } from "../models/Player";
import { Enemy as EnemyModel } from "../models/EnemyModel";
import { StageManager } from "../managers/StageManager";

export function useGameHandlers(
  player: PlayerModel,
  setPlayer: React.Dispatch<React.SetStateAction<PlayerModel>>,
  currentEnemies: EnemyModel[],
  setCurrentEnemies: React.Dispatch<React.SetStateAction<EnemyModel[]>>,
  targetIndex: number,
  setTargetIndex: React.Dispatch<React.SetStateAction<number>>,
  setMessage: React.Dispatch<React.SetStateAction<any>>,
  setReadyForNextStage: React.Dispatch<React.SetStateAction<boolean>>,
  inputRef: React.RefObject<HTMLInputElement | null>,
  gainEXP: (amount: number) => boolean
) {
  // 新しいステージの生成
  const spawnNewStage = useCallback(() => {
    const { enemies, message } = StageManager.createNewStage();
    setCurrentEnemies(enemies);
    setTargetIndex(0);
    setMessage(message);
  }, [setCurrentEnemies, setTargetIndex, setMessage]);
  
  // ターゲット選択の処理
  const handleSelectTarget = useCallback((index: number) => {
    setTargetIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [setTargetIndex, inputRef]);
  
  // 次のステージへ進むハンドラ
  const handleNextStage = useCallback(() => {
    spawnNewStage();
    setReadyForNextStage(false);
  }, [spawnNewStage, setReadyForNextStage]);
  
  // 死亡後のゲーム継続処理
  const handleContinueGame = useCallback(() => {
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
    if (currentEnemies.every((enemy) => enemy.defeated)) {
      spawnNewStage();
    }
  }, [player, setPlayer, currentEnemies, spawnNewStage, setMessage]);
  
  // ステージクリア判定
  const checkStageCompletion = useCallback((enemies = currentEnemies) => {
    return StageManager.handleStageCompletion(
      enemies,
      gainEXP,
      setMessage,
      setReadyForNextStage
    );
  }, [currentEnemies, gainEXP, setMessage, setReadyForNextStage]);
  
  return {
    spawnNewStage,
    handleSelectTarget,
    handleNextStage,
    handleContinueGame,
    checkStageCompletion
  };
}