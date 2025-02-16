// src/App.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import enemies, { EnemyType } from "./data/enemyData";
import { commonQuestions, Question } from "./data/questions";
import { Player as PlayerModel } from "./models/Player";
import {
  LEVEL_UP_MESSAGE_DURATION,
  EXP_GAIN_DISPLAY_DURATION,
  INPUT_FOCUS_DELAY,
  MESSAGE_DISPLAY_DURATION,
  ENEMY_HIT_ANIMATION_DURATION,
} from "./data/constants";

const App: React.FC = () => {
  // プレイヤーのパラメータは Player クラスのインスタンスで管理
  const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());

  // 敵やその他の状態
  const [currentEnemy, setCurrentEnemy] = useState<EnemyType>(
    { ...enemies[0], currentHP: enemies[0].maxHP }
  );
  const [message, setMessage] = useState("問題に正しく回答して敵を倒せ！");
  const [expGain, setExpGain] = useState<number | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [showExpBar, setShowExpBar] = useState(false);

  // 出題関連の状態
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // UI 状態
  const [enemyHit, setEnemyHit] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [readyForNextEnemy, setReadyForNextEnemy] = useState(false);
  const [battlePaused, setBattlePaused] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 敵が更新された際に新しい問題を設定
  useEffect(() => {
    if (currentEnemy && currentEnemy.currentHP > 0) {
      if (currentEnemy.originalQuestion) {
        setCurrentQuestion(currentEnemy.originalQuestion);
      } else {
        setCurrentQuestion(
          commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
        );
      }
      setWrongAttempts(0);
      setShowQuestion(true);
      setReadyForNextEnemy(false);
    }
  }, [currentEnemy]);

  // handleEnemyAttack を useCallback でメモ化
  const handleEnemyAttack = useCallback(() => {
    if (currentEnemy.currentHP <= 0) return;
    const damage = Math.max(1, currentEnemy.attackPower - Math.floor(Math.random() * 3));
    setPlayer(prev => prev.takeDamage(damage));
    setMessage(`${currentEnemy.name} の攻撃！ ${damage} のダメージ！`);
  }, [currentEnemy]);

  const updateQuestion = () => {
    setCurrentQuestion(
      commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
    );
    setWrongAttempts(0);
  };

  // プレイヤー攻撃：正解なら敵にダメージを与え、経験値を加算
  const handlePlayerAttack = (input: string) => {
    if (readyForNextEnemy || !currentQuestion) return;
    if (input.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setEnemyHit(true);
      setShowQuestion(false);

      const monsterName = currentEnemy.name;
      const monsterExp = currentEnemy.exp;
      const damage = Math.max(5, player.attack - currentEnemy.defense);
      const newEnemyHP = currentEnemy.currentHP - damage;

      setCurrentEnemy(prev => ({
        ...prev,
        currentHP: Math.max(0, newEnemyHP),
      }));

      setMessage(`正解！${damage} のダメージを与えた！`);

      setTimeout(() => {
        setEnemyHit(false);
      }, ENEMY_HIT_ANIMATION_DURATION);

      if (newEnemyHP <= 0) {
        setMessage(`${monsterName} を倒した。${monsterExp} ポイントの経験値を得た。次は「次の敵に進む」ボタンを押せ。`);
        gainEXP(monsterExp);
        handleEnemyDefeat();
      } else {
        updateQuestion();
        setShowQuestion(true);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      setMessage("間違い！正しい解答を入力してください！");
    }
  };

  // 経験値獲得処理
  const gainEXP = (amount: number) => {
    setExpGain(amount);
    setTimeout(() => setExpGain(null), EXP_GAIN_DISPLAY_DURATION);
    setPlayer(prev => prev.addExp(amount));
    setShowExpBar(true);
  };

  useEffect(() => {
    if (player.exp >= player.levelUpThreshold) {
      levelUp();
    }
  }, [player.exp, player]);

  const levelUp = () => {
    setLevelUpMessage(`レベルアップ！ (Lv.${player.level})`);
    setTimeout(() => {
      setLevelUpMessage("");
      setShowExpBar(false);
    }, LEVEL_UP_MESSAGE_DURATION);
  };

  const spawnNewEnemy = () => {
    const possibleEnemies = enemies.filter(e => e.level <= player.level);
    const newEnemy = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
    setCurrentEnemy({ ...newEnemy, currentHP: newEnemy.maxHP });
    if (newEnemy.originalQuestion) {
      setCurrentQuestion(newEnemy.originalQuestion);
    } else {
      setCurrentQuestion(
        commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
      );
    }
    setMessage(`${newEnemy.name} (Lv.${newEnemy.level}) が現れた！`);
    setWrongAttempts(0);
    setShowQuestion(true);
    setReadyForNextEnemy(false);
    setBattlePaused(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, INPUT_FOCUS_DELAY);
  };

  const handleEnemyDefeat = () => {
    setMessage("敵を倒した！次に進むにはEnterキーを押すかボタンをクリックして下さい");
    setReadyForNextEnemy(true);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && battlePaused && readyForNextEnemy) {
        spawnNewEnemy();
      }
      setBattlePaused(readyForNextEnemy);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readyForNextEnemy, battlePaused]);

  useEffect(() => {
    return () => {
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    };
  }, []);

  if (player.hp <= 0) {
    return <GameOver totalEXP={player.totalExp} />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 上半分：バトルステージ */}
      <div className="relative flex-1">
        <BattleStage
          currentEnemy={currentEnemy}
          player={player} // player オブジェクトを渡す
          onEnemyAttack={handleEnemyAttack}
          message={message}
          currentQuestion={currentQuestion}
          wrongAttempts={wrongAttempts}
          enemyHit={enemyHit}
          showQuestion={showQuestion}        
          />
        {levelUpMessage && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-50 text-white px-6 py-4 rounded-lg text-center shadow-xl border-2 border-white">
            {levelUpMessage}
          </div>
        )}
        {readyForNextEnemy && (
          <div className="absolute bottom-50 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => {
                spawnNewEnemy();
                setReadyForNextEnemy(false);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
            >
              次の敵に進む
            </button>
          </div>
        )}
      </div>
      {/* 下半分：プレイヤーのステータス＆入力 */}
      <div className="flex-1 bg-gray-900">
        <BattleInterface
          player={player}
          onSubmit={handlePlayerAttack}
          currentQuestion={currentQuestion}
          expGain={expGain}
          inputRef={inputRef}
        />
      </div>
    </div>
  );
};

export default App;
