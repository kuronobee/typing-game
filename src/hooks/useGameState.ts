// src/hooks/useGameState.ts
import { useState } from 'react';
import { Player as PlayerModel } from "../models/Player";
import { Enemy as EnemyModel } from "../models/EnemyModel";
import { Question } from "../data/questions"; // commonQuestionsをインポート
import { allCommonQuestions } from "../data/questions";
import { MessageType } from "../components/MessageDisplay";

export function useGameState() {
  // プレイヤーの状態
  const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());
  
  // レベルアップ関連
  const [levelUpQueue, setLevelUpQueue] = useState<number[]>([]);
  const [currentShowingLevel, setCurrentShowingLevel] = useState<number | null>(null);
  
  // 戦闘関連の状態
  const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  // 初期状態でランダムな問題を設定
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    allCommonQuestions[Math.floor(Math.random() * allCommonQuestions.length)]
  );
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);
  const [comboCount, setComboCount] = useState<number>(0);
  const [readyForNextStage, setReadyForNextStage] = useState(false);
  
  // UI状態
  const [message, setMessage] = useState<MessageType | null>(null);
  const [expGain, setExpGain] = useState<number | null>(null);
  const [isDead, setIsDead] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [stageScale, setStageScale] = useState<number | null>(1);

  return {
    // プレイヤー状態
    player, setPlayer,
    
    // レベルアップ
    levelUpQueue, setLevelUpQueue,
    currentShowingLevel, setCurrentShowingLevel,
    
    // 戦闘関連
    currentEnemies, setCurrentEnemies,
    targetIndex, setTargetIndex,
    currentQuestion, setCurrentQuestion, // この行を追加
    wrongAttempts, setWrongAttempts,
    isHintFullyRevealed, setIsHintFullyRevealed,
    comboCount, setComboCount,
    readyForNextStage, setReadyForNextStage,
    
    // UI状態
    message, setMessage,
    expGain, setExpGain,
    isDead, setIsDead,
    showGameOver, setShowGameOver,
    stageScale, setStageScale,
  };
}