// App.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import enemies, { EnemyType } from "./data/enemyData";
import { commonQuestions, Question } from "./data/questions";
import {
  INITIAL_PLAYER_HP,
  INITIAL_PLAYER_MP,
  INITIAL_PLAYER_SPEED,
  INITIAL_PLAYER_LEVEL,
  INITIAL_PLAYER_EXP,
  INITIAL_PLAYER_TOTAL_EXP,
  BASE_PLAYER_ATTACK,
  PLAYER_ATTACK_LEVEL_MULTIPLIER,
  LEVEL_UP_EXP_MULTIPLIER,
  LEVEL_UP_MESSAGE_DURATION,
  EXP_GAIN_DISPLAY_DURATION,
  INPUT_FOCUS_DELAY,
  ENEMY_HIT_ANIMATION_DURATION,
} from "./data/constants";

const App: React.FC = () => {
  // プレイヤーの状態
  const [playerHP, setPlayerHP] = useState(INITIAL_PLAYER_HP);
  const [playerMP, setPlayerMP] = useState(INITIAL_PLAYER_MP);
  const [playerLevel, setPlayerLevel] = useState(INITIAL_PLAYER_LEVEL);
  const [playerEXP, setPlayerEXP] = useState(INITIAL_PLAYER_EXP);
  const [totalEXP, setTotalEXP] = useState(INITIAL_PLAYER_TOTAL_EXP);
  // プレイヤーの speed（例として 100）
  const [playerSpeed, setPlayerSpeed] = useState(INITIAL_PLAYER_SPEED);

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

  // アニメーション・UI関連の状態
  const [enemyHit, setEnemyHit] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [readyForNextEnemy, setReadyForNextEnemy] = useState(false);
  const [battlePaused, setBattlePaused] = useState(false);

  // 攻撃力やレベルアップに必要な経験値の計算
  const playerAttackPower = BASE_PLAYER_ATTACK + playerLevel * PLAYER_ATTACK_LEVEL_MULTIPLIER;
  const levelUpThreshold = playerLevel * LEVEL_UP_EXP_MULTIPLIER;
  
  const inputRef = useRef<HTMLInputElement>(null);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // currentEnemy 更新時に、出題内容を設定
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

  // handleEnemyAttack を useCallback でメモ化（currentEnemy が変わったときのみ再生成）
  const handleEnemyAttack = useCallback(() => {
    if (currentEnemy.currentHP <= 0) return;
    const damage = Math.max(1, currentEnemy.attackPower - Math.floor(Math.random() * 3));
    setPlayerHP((prev) => Math.max(0, prev - damage));
    setMessage(`${currentEnemy.name} の攻撃！ ${damage} のダメージ！`);
  }, [currentEnemy]);

  // 問題更新用の関数
  const updateQuestion = () => {
    setCurrentQuestion(
      commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
    );
    setWrongAttempts(0);
  };

  // 正解時の処理
  const handlePlayerAttack = (input: string) => {
    if (readyForNextEnemy || !currentQuestion) return;

    if (input.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setEnemyHit(true);
      setShowQuestion(false);

      const monsterName = currentEnemy.name;
      const monsterExp = currentEnemy.exp;
      const damage = Math.max(5, playerAttackPower - currentEnemy.defense);
      const newHP = currentEnemy.currentHP - damage;

      console.log("Damage:", damage, "New HP:", newHP);

      setCurrentEnemy((prev) => ({
        ...prev,
        currentHP: Math.max(0, newHP),
      }));

      setMessage(`正解！${damage} のダメージを与えた！`);

      setTimeout(() => {
        setEnemyHit(false);
      }, ENEMY_HIT_ANIMATION_DURATION);

      if (newHP <= 0) {
        setMessage(`${monsterName} を倒した。${monsterExp} ポイントの経験値を得た。次は「次の敵に進む」ボタンを押せ。`);
        gainEXP(monsterExp);
        handleEnemyDefeat();
      } else {
        updateQuestion();
        setShowQuestion(true);
      }
    } else {
      setWrongAttempts((prev) => prev + 1);
      setMessage("間違い！正しい解答を入力してください！");
    }
  };

  // 経験値獲得処理
  const gainEXP = (amount: number) => {
    setExpGain(amount);
    setTimeout(() => setExpGain(null), EXP_GAIN_DISPLAY_DURATION);
    setTotalEXP((prev) => prev + amount);
    setPlayerEXP((prev) => prev + amount);
    setShowExpBar(true);
  };

  useEffect(() => {
    if (playerEXP >= levelUpThreshold) {
      levelUp();
    }
  }, [playerEXP, levelUpThreshold]);

  const levelUp = () => {
    const overflowEXP = playerEXP - levelUpThreshold;
    const hpIncrease = 20 + Math.floor(Math.random() * 5);
    const mpIncrease = 10 + Math.floor(Math.random() * 3);
    const attackIncrease = 2;

    setPlayerLevel((prev) => prev + 1);
    setPlayerEXP(overflowEXP >= 0 ? overflowEXP : 0);
    setPlayerHP((prev) => prev + hpIncrease);
    setPlayerMP((prev) => prev + mpIncrease);
    setLevelUpMessage(
      `レベルアップ！ (Lv.${playerLevel + 1})\nHP +${hpIncrease}, MP +${mpIncrease}, 攻撃力 +${attackIncrease}`
    );

    setTimeout(() => {
      setLevelUpMessage("");
      setShowExpBar(false);
    }, LEVEL_UP_MESSAGE_DURATION);
  };

  // 次の敵出現処理
  const spawnNewEnemy = () => {
    const possibleEnemies = enemies.filter((e) => e.level <= playerLevel);
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

  // 敵が倒れたときの処理
  const handleEnemyDefeat = () => {
    setMessage("敵を倒した！次に進むにはEnterキーを押すかボタンをクリックして下さい");
    setReadyForNextEnemy(true);
  };

  // Enterキーで次の敵に進む処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && battlePaused && readyForNextEnemy) {
        spawnNewEnemy();
      }
      setBattlePaused(readyForNextEnemy);
    };
    
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [readyForNextEnemy, battlePaused]);

  // コンポーネントアンマウント時のタイマークリア
  useEffect(() => {
    return () => {
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    };
  }, []);

  if (playerHP <= 0) {
    return <GameOver totalEXP={totalEXP} />;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      {/* 上半分：バトルエリア */}
      <div className="relative flex-1">
        <BattleStage
          currentEnemy={currentEnemy}
          playerHP={playerHP}
          onEnemyAttack={handleEnemyAttack}
          message={message}
          currentQuestion={currentQuestion}
          wrongAttempts={wrongAttempts}
          enemyHit={enemyHit}
          showQuestion={showQuestion}
          playerSpeed={playerSpeed}
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
          playerHP={playerHP}
          maxHP={INITIAL_PLAYER_HP + playerLevel * 10}
          playerMP={playerMP}
          maxMP={INITIAL_PLAYER_MP + playerLevel * 5}
          playerLevel={playerLevel}
          playerEXP={playerEXP}
          expToNextLevel={levelUpThreshold}
          totalEXP={totalEXP}
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
