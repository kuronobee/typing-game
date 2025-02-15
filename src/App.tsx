import React, { useState, useEffect, useRef } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import enemies, { EnemyType } from "./data/enemyData";
import { commonQuestions, Question } from "./data/questions";

const App: React.FC = () => {
  // プレイヤー・敵・経験値などの状態
  const [playerHP, setPlayerHP] = useState(100);
  const [playerMP, setPlayerMP] = useState(50);
  const [playerLevel, setPlayerLevel] = useState(1);
  const [playerEXP, setPlayerEXP] = useState(0);
  const [totalEXP, setTotalEXP] = useState(0);
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

  // アニメーション用の状態
  const [enemyHit, setEnemyHit] = useState(false);
  // 問題コンテナの表示状態（true: 表示、false: 非表示）
  const [showQuestion, setShowQuestion] = useState(true);
  // 敵が倒された後、次の敵出現待ちの場合の状態
  const [readyForNextEnemy, setReadyForNextEnemy] = useState(false);
  const [battlePaused, setBattlePaused] = useState(false); // 戦闘停止の状態

  const playerAttackPower = 10 + playerLevel * 2;
  const levelUpThreshold = playerLevel * 100;
  const expProgress = (playerEXP / levelUpThreshold) * 100;
  
  const inputRef = useRef<HTMLInputElement>(null);
  // タイマー管理用の ref
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // currentEnemy 更新時に、質問をセットする
  useEffect(() => {
    if (currentEnemy) {
      if(currentEnemy.currentHP > 0) {
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

    }
  }, [currentEnemy]);

  // 敵の攻撃処理（敵が倒れている場合はスキップ）
  const handleEnemyAttack = () => {
    if (currentEnemy.currentHP <= 0) return;
    const damage = Math.max(1, currentEnemy.attackPower - Math.floor(Math.random() * 3));
    setPlayerHP((prev) => Math.max(0, prev - damage));
    setMessage(`${currentEnemy.name} の攻撃！ ${damage} のダメージ！`);
  };

  // 敵がまだ倒れていない場合の問題更新（今回は共通問題を再セット）
  const updateQuestion = () => {
    setCurrentQuestion(
      commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
    );
    setWrongAttempts(0);
  };

  // 正解時の処理
  const handlePlayerAttack = (input: string) => {
    // もし次の敵出現待ち状態なら、何もしない（ボタンで進むので）
    if (readyForNextEnemy) return;
    if (!currentQuestion) return;

    if (input.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setEnemyHit(true);
      setShowQuestion(false);

      const monsterName = currentEnemy.name;
      const monsterExp = currentEnemy.exp;
      const damage = Math.max(5, playerAttackPower - currentEnemy.defense);
      const newHP = currentEnemy.currentHP - damage;

      // ログ出力（デバッグ用）
      console.log("Damage:", damage, "New HP:", newHP);

      setCurrentEnemy((prev) => ({
        ...prev,
        currentHP: Math.max(0, newHP),
      }));

      setMessage(`正解！${damage} のダメージを与えた！`);

      setTimeout(() => {
        setEnemyHit(false);
      }, 300);

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
    setTimeout(() => setExpGain(null), 2000);
    setTotalEXP((prev) => prev + amount);
    setPlayerEXP((prev) => prev + amount);
    setShowExpBar(true);
  };

  useEffect(() => {
    if (playerEXP >= levelUpThreshold) {
      levelUp();
    }
  }, [playerEXP]);

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
    }, 3000);
  };

  // 次の敵出現処理（「次の敵に進む」ボタン押下時に呼ばれる）
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
    setBattlePaused(false); // 戦闘を再開

    setTimeout(() => {
      inputRef.current?.focus();  // ボタンが押されたらフォーカスを当てる
    }, 100);
  };

  // 敵が倒れたときの処理
  const handleEnemyDefeat = () => {
    setMessage("敵を倒した！次に進むにはEnterキーを押すかボタンをクリックして下さい");
    setReadyForNextEnemy(true);
  }

  // Enterキーで次の敵にす数
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key == "Enter" && battlePaused && readyForNextEnemy) {
        spawnNewEnemy();
      }
      setBattlePaused(readyForNextEnemy); 
    };
    
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    }
  }, [readyForNextEnemy, battlePaused]);  // readyForNextEnemyの変更を監視

  // コンポーネントアンマウント時にタイマーをクリア
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
        />
        {levelUpMessage && (
          <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-50 bg-black bg-opacity-50 text-white px-6 py-4 rounded-lg text-center shadow-xl border-2 border-white">
            {levelUpMessage}
          </div>
        )}
        {/* 次の敵に進むボタン：敵が倒され、次の敵出現待ちの場合のみ表示 */}
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
          maxHP={100 + playerLevel * 10}
          playerMP={playerMP}
          maxMP={50 + playerLevel * 5}
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
