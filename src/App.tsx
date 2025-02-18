// src/App.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import enemiesData, { EnemyType } from "./data/enemyData"; // 既存の生データ
import { commonQuestions, Question } from "./data/questions";
import { Player as PlayerModel, StatusEffect } from "./models/Player";
import { Enemy as EnemyModel } from "./models/EnemyModel"; // 新しく作成したEnemyクラス
import {MessageType} from "./components/MessageDisplay";
import {
  LEVEL_UP_MESSAGE_DURATION,
  EXP_GAIN_DISPLAY_DURATION,
  INPUT_FOCUS_DELAY,
  ENEMY_HIT_ANIMATION_DURATION,
} from "./data/constants";

const App: React.FC = () => {
  // プレイヤーはPlayerクラスのインスタンスで管理
  const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());

  // 敵については、初期状態をnullにしておく
  const [currentEnemy, setCurrentEnemy] = useState<EnemyModel | null>(null);
  const [message, setMessage] = useState<MessageType | null>({text: "問題に正しく回答して敵を倒せ！", sender: "system"});
  const [expGain, setExpGain] = useState<number | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState("");
  const [showExpBar, setShowExpBar] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [enemyHit, setEnemyHit] = useState(false);
  const [showQuestion, setShowQuestion] = useState(true);
  const [readyForNextEnemy, setReadyForNextEnemy] = useState(false);
  const [battlePaused, setBattlePaused] = useState(false);
  // 問題のラウンド数
  const [round, setRound] = useState(1);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 毒の場合は毒タイマー
  const poisonTimerRef = useRef<NodeJS.Timeout | null>(null);
  // プレイヤーの最新情報を保持するための ref
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);
  
  // 毒攻撃を受けた時に呼ばれる関数
  const handlePoisonAttack = (poisonEffect: StatusEffect) => {
  // すでに毒のタイマーが動作中なら、何もしない
  if (poisonTimerRef.current !== null) {
    console.log("handlePoisonAttack: 毒のタイマーが動作中です");
    return;
  }
  
  // 毒の持続時間を player.statusEffects から取得
  //const poisonEffect = player.statusEffects.find(e => e.type === "poison");
  const ticks = poisonEffect.ticks;
  // if (!poisonEffect) {
  //   console.log("handlePoisonAttack: 毒状態が見つかりません");
  //   return;
  // }

  //const ticks = poisonEffect.ticks;
  console.log("handlePoisonAttack: 毒のタイマーを起動します");

  // 1秒ごとにプレイヤーにダメージを与えるタイマーをセット（毎秒ダメージ）
  poisonTimerRef.current = setInterval(() => {
    console.log("handlePoisonAttack: setInterval 実行中");
    setPlayer(prev => prev.takeDamage(poisonEffect.damagePerTick));
  }, 1000); // 1秒ごとに実行

  // ticks 秒後に毒のタイマーを停止
  setTimeout(() => {
    console.log("handlePoisonAttack: setTimeout 実行中");
    clearInterval(poisonTimerRef.current!);
    setPlayer(prev => prev.removeStatusEffects("poison"));
    poisonTimerRef.current = null;
  }, ticks * 1000);
};

  useEffect(() => {
    if (!currentEnemy) {
      spawnNewEnemy();
    }
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


  const handleEnemyAttack = useCallback(() => {
    if(currentEnemy === undefined) return;
    if (currentEnemy!.currentHP <= 0) return;
    // playerを直接指定して、playerを監視にするとAppコンポーネントが再レンダリングされてしまい、攻撃インジケータがリセットされる不具合発生するため、useRef取得したplayerを使う
    const attack = currentEnemy!.performAttack(playerRef.current); 
    // 特殊攻撃を受けた場合の処理
    if (attack.special) {
      // ステータス異常を付与
      setPlayer(prev => prev.applyStatusEffects(attack.result.statusEffects));
      // ステータス異常（毒効果）
      const poisonEffect = attack.result.statusEffects.find(e => e.type === "poison");
      if (poisonEffect) {
        console.log("毒攻撃を受けました");
        handlePoisonAttack(poisonEffect);
      }
      // ステータス異常（...） 今後追加予定
      // if (  ) {}

      // 特殊攻撃の場合は、特殊攻撃のメッセージを表示
      const effect_message = `${attack.result.message}`;
      const damage_message = attack.result.damage != 0 ? `${attack.result.damage}のダメージ！`: "";
      setMessage({text: effect_message + damage_message, sender: "enemy"});
    } else {  
      // 通常攻撃の場合のメッセージ
      setMessage({text: `${currentEnemy!.name} の攻撃！ ${attack.result.damage} のダメージ！`, sender: "enemy"});
    }
    // ダメージを受ける処理
    setPlayer(prev => prev.takeDamage(attack.result.damage));
  }, [currentEnemy]);



  const updateQuestion = () => {
    setCurrentQuestion(
      commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
    );
    setRound(prev => prev + 1); // 問題のラウンド数を更新
    setWrongAttempts(0);
  };

  const handlePlayerAttack = (input: string) => {
    if (readyForNextEnemy || !currentQuestion) return;
    if (input.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      setEnemyHit(true);
      setShowQuestion(false);
      const monsterName = currentEnemy.name;
      const monsterExp = currentEnemy.exp;
      // ダメージ計算ここから
      // 敵に与える基本ダメージ
      const { damage, effectiveWrongAttempts, multiplier } = calculateEffectiveDamage();
      // ダメージ計算ここまで
      // 敵モデルの内部処理でダメージを適用
      currentEnemy.takeDamage(damage);
      setMessage({text: `正解！${damage} のダメージを与えた！${effectiveWrongAttempts === 0 ? "" : "(ダメージ" + Math.floor((1-multiplier) * 100) + "%減)"}`, sender: "player"});
      setTimeout(() => {
        setEnemyHit(false);
      }, ENEMY_HIT_ANIMATION_DURATION);

      if (currentEnemy.currentHP <= 0) {
        setMessage({text: `${monsterName} を倒した。${monsterExp} ポイントの経験値を得た。次は「次の敵に進む」ボタンを押せ。`, sender: "system"});
        // プレイヤーの経験値加算処理（Player.addExp を利用）
        setPlayer(prev => prev.addExp(monsterExp));
        handleEnemyDefeat();
      } else {
        updateQuestion();
        setShowQuestion(true);
      }
    } else {
      setWrongAttempts(prev => prev + 1);
      setMessage({text: "間違い！正しい解答を入力してください！", sender: "system"});
    }
    // ダメージ計算関数
    function calculateEffectiveDamage() {
      const baseDamage = Math.max(5, player.attack - currentEnemy.defense);
      console.log("baseDamage: ", baseDamage);
      // 最大ヒント数は、答えの空白を除いた文字数
      const answerNoSpaces = currentQuestion.answer.replace(/\s/g, "");
      const maxHints = answerNoSpaces.length;
      const effectiveWrongAttempts = isHintFullyRevealed ? maxHints : wrongAttempts;
      console.log("effectiveWrongAttempts: ", effectiveWrongAttempts);
      // ヒントの割合(0〜1)
      const hintFraction = effectiveWrongAttempts / maxHints;
      // 攻撃力倍率：ヒントが全て表示されていれば0.5、何も表示されなければ1.0
      const multiplier = 1 - (hintFraction / 2);
      const damage = Math.floor(baseDamage * multiplier);
      console.log("damage: ", damage);
      return { damage, effectiveWrongAttempts, multiplier };
    }
  };

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
    // ここは既存の敵データから新しい EnemyModel インスタンスを生成します
    const possibleEnemies = enemiesData.filter(e => e.level <= player.level);
    const newEnemyData = possibleEnemies[Math.floor(Math.random() * possibleEnemies.length)];
    setCurrentEnemy(new EnemyModel(newEnemyData));
    if (newEnemyData.originalQuestion) {
      setCurrentQuestion(newEnemyData.originalQuestion);
    } else {
      setCurrentQuestion(
        commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
      );
    }
    setMessage({text: `${newEnemyData.name} (Lv.${newEnemyData.level}) が現れた！`, sender: "system"});
    setWrongAttempts(0);
    setShowQuestion(true);
    setReadyForNextEnemy(false);
    setBattlePaused(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, INPUT_FOCUS_DELAY);
  };

  const handleEnemyDefeat = () => {
    setMessage({text: "敵を倒した！次に進むにはEnterキーを押すかボタンをクリックして下さい", sender: "system"});
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
  if (!currentEnemy) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="w-full h-screen flex flex-col">
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
          round={round}
          onFullRevealChange={setIsHintFullyRevealed}
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
      <div className="flex-1 bg-gray-900">
        <BattleInterface
          player={player} // playerオブジェクトを渡す
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
