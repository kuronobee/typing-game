// src/App.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import { commonQuestions, Question } from "./data/questions";
import { Player as PlayerModel, StatusEffect } from "./models/Player";
import { Enemy as EnemyModel } from "./models/EnemyModel";
import { MessageType } from "./components/MessageDisplay";
import {
  EXP_GAIN_DISPLAY_DURATION,
  ENEMY_HIT_ANIMATION_DURATION,
  PLAYER_HIT_ANIMATION_DURATION,
  PLAYER_FIREBREATH_ANIMATION_DURATION,
  COMBO_ANIMATION_DURATION,
} from "./data/constants";
import { stages } from "./data/stages";
import LevelUpNotifier from "./components/LevelUpNotifier";
// カスタムフックのインポート
import useKeyboardVisibility from "./hooks/useKeyboardVisibility";
import useIOSScrollPrevention from "./hooks/useIOSScrollPrevention";

const App: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // マウント時に入力フィールドにフォーカス
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // カスタムフックの使用
  const isKeyboardVisible = useKeyboardVisibility(inputRef);
  useIOSScrollPrevention(inputRef);

  // プレイヤーの状態
  const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // 戦闘関連の状態
  const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
  );
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);
  const [comboCount, setComboCount] = useState<number>(0);
  const [showCombo, setShowCombo] = useState<boolean>(false);
  const [readyForNextStage, setReadyForNextStage] = useState(false);
  
  // 視覚効果の状態
  const [isScreenHit, setIsScreenHit] = useState<boolean>(false);
  const [isScreenShake, setIsScreenShake] = useState<boolean>(false);
  const [enemyAttackFlags, setEnemyAttackFlags] = useState<boolean[]>([]);
  const [enemyFireFlags, setEnemyFireFlags] = useState<boolean[]>([]);
  const [enemyHitFlags, setEnemyHitFlags] = useState<boolean[]>([]);
  
  // UI状態
  const [message, setMessage] = useState<MessageType | null>({
    text: "問題に正しく回答して敵を倒せ！",
    sender: "system",
  });
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [expGain, setExpGain] = useState<number | null>(null);
  
  // ダメージ表示
  type DamageDisplay = { value: number; id: number };
  const [damageNumbers, setDamageNumbers] = useState<(DamageDisplay | null)[]>([]);
  
  // タイマーと追跡用のref
  const questionTimeoutRef = useRef<number | null>(null);
  const poisonTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevLevelRef = useRef(player.level);

  // レベルアップ通知のためのレベル変更の追跡
  useEffect(() => {
    if (player.level > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = player.level;
  }, [player.level]);

  // コンボアニメーションのCSSプロパティ設定
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--combo-animation-duration",
      `${COMBO_ANIMATION_DURATION}ms`
    );
  }, []);

  // 敵が変わったときにダメージ表示配列を初期化
  useEffect(() => {
    setDamageNumbers(currentEnemies.map(() => null));
  }, [currentEnemies]);

  // 敵が変わったときにアニメーションフラグ配列を初期化
  useEffect(() => {
    setEnemyAttackFlags(currentEnemies.map(() => false));
    setEnemyFireFlags(currentEnemies.map(() => false));
    setEnemyHitFlags(currentEnemies.map(() => false));
  }, [currentEnemies]);

  // マウント時に初期ステージを生成
  useEffect(() => {
    spawnNewStage();
  }, []);

  // ターゲットが変わったときに現在の問題を更新
  useEffect(() => {
    if (currentEnemies.length > 0) {
      const targetEnemy = currentEnemies[targetIndex];
      if (targetEnemy && !targetEnemy.defeated) {
        setCurrentQuestion(
          targetEnemy.presentedQuestion || targetEnemy.getNextQuestion()
        );
      }
    }
  }, [targetIndex, currentEnemies]);

  // タブによるターゲット選択とステージ進行のためのキーダウンイベント処理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Shift+Tabで反時計回りにターゲット選択
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault();
        if (currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          setTargetIndex((prev) => {
            const findPrevAliveIndex = (index: number): number => {
              let newIndex = index - 1;
              if (newIndex < 0) {
                newIndex = currentEnemies.length - 1;
              }
              if (currentEnemies[newIndex].defeated) {
                return findPrevAliveIndex(newIndex);
              }
              return newIndex;
            };
            return findPrevAliveIndex(prev);
          });
        }
      }
      // Tabで時計回りにターゲット選択
      else if (event.key === "Tab") {
        event.preventDefault();
        if (currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          setTargetIndex((prev) => {
            const findNextAliveIndex = (index: number): number => {
              const newIndex = (index + 1) % currentEnemies.length;
              if (newIndex === index) return index;
              if (currentEnemies[newIndex].defeated) {
                return findNextAliveIndex(newIndex);
              }
              return newIndex;
            };
            return findNextAliveIndex(prev);
          });
        }
      }
      // Enterで次のステージへ進む
      else if (event.key === "Enter" && readyForNextStage) {
        spawnNewStage();
        setReadyForNextStage(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readyForNextStage, currentEnemies]);

  // アンマウント時にタイムアウトをクリア
  useEffect(() => {
    return () => {
      if (questionTimeoutRef.current) {
        clearTimeout(questionTimeoutRef.current);
      }
    };
  }, []);

  // 毒状態効果の処理
  const handlePoisonAttack = (poisonEffect: StatusEffect) => {
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
  };

  // 敵の攻撃アニメーションをトリガー
  const triggerEnemyAttackAnimation = (
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
  };

  // 次の生存している敵を見つける
  const findNextAliveEnemyIndex = (
    startIndex: number,
    enemies: EnemyModel[]
  ): number => {
    // 現在のインデックスから後ろ向きに探索
    for (let i = startIndex + 1; i < enemies.length; i++) {
      if (!enemies[i].defeated) {
        return i;
      }
    }
    // 必要に応じて最初から探索
    for (let i = 0; i <= startIndex; i++) {
      if (!enemies[i].defeated) {
        return i;
      }
    }
    return -1; // すべての敵が倒された
  };

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
    [currentEnemies, playerRef]
  );

  // プレイヤー攻撃の有効ダメージ計算
  function calculateEffectiveDamage(currentQuestion: Question, combo: number) {
    const targetEnemy = currentEnemies[targetIndex];

    // 基本ダメージ計算
    const baseDamage = Math.max(5, player.attack - targetEnemy.defense);
    const randomFactor = 0.9 + Math.random() * 0.2;
    let damage = baseDamage * randomFactor;

    // ヒントペナルティ
    const answerNoSpaces = currentQuestion.answer.replace(/\s/g, "");
    const maxHints = answerNoSpaces.length;
    const effectiveWrongAttempts = isHintFullyRevealed
      ? maxHints
      : wrongAttempts;
    const hintFraction = effectiveWrongAttempts / maxHints;
    const multiplier = 1 - hintFraction / 2;
    damage *= multiplier;

    // ヒット/ミス/クリティカル計算のためのステータス
    const playerLuck = player.luck || 0;
    const playerPower = player.power || 0;
    const enemyLuck = targetEnemy.luck || 0;
    const enemySpeed = targetEnemy.speed || 0;

    // ミスとクリティカル確率の計算
    const missProbability = Math.min(
      0.01 + (enemyLuck + enemySpeed) * 0.005,
      0.1
    );
    const critProbability = Math.min(
      0.01 + (playerLuck + playerPower) * 0.005,
      0.15
    );

    // ヒントが完全に公開されている場合はクリティカルなし
    const effectiveCritProbability = isHintFullyRevealed ? 0 : critProbability;

    const rand = Math.random();
    let specialMessage = "";

    // ミス判定
    if (rand < missProbability) {
      damage = 0;
      specialMessage = "ミス！";
    } else if (rand < missProbability + effectiveCritProbability) {
      // クリティカルヒット
      damage = Math.floor(player.attack * randomFactor * 1.5);
      specialMessage = "クリティカル！";
    } else {
      damage = Math.floor(damage);
    }

    // コンボダメージボーナス
    damage = Math.floor(damage * (1 + combo * 0.011));

    return { damage, effectiveWrongAttempts, multiplier, specialMessage };
  }

  // プレイヤーが敵を攻撃する処理
  const handlePlayerAttack = (input: string) => {
    if (!currentEnemies.length) return;
    
    const targetEnemy = currentEnemies[targetIndex];
    if (!targetEnemy || targetEnemy.defeated) return;

    if (!currentQuestion) {
      setCurrentQuestion(targetEnemy.getNextQuestion());
    }

    const trimmedInput = input.trim();

    if (trimmedInput.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      // 正解の場合
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), COMBO_ANIMATION_DURATION);

      const { damage, specialMessage } = calculateEffectiveDamage(
        currentQuestion,
        newCombo
      );
      targetEnemy.takeDamage(damage);

      // ダメージ数字を表示
      const newDamage: DamageDisplay = { value: damage, id: Date.now() };
      setDamageNumbers((prev) => {
        const newArr = [...prev];
        newArr[targetIndex] = newDamage;
        return newArr;
      });
      
      // 遅延後にダメージ数字をクリア
      setTimeout(() => {
        setDamageNumbers((prev) => {
          const newArr = [...prev];
          newArr[targetIndex] = null;
          return newArr;
        });
      }, 1000);

      // ヒットアニメーションを表示
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
      }, ENEMY_HIT_ANIMATION_DURATION);

      // ダメージに基づいてメッセージを設定
      if (damage === 0) {
        setMessage({
          text: "正解！しかし、攻撃を外してしまった！",
          sender: "player",
        });
      } else {
        setMessage({
          text: `正解！${specialMessage} ${damage} のダメージを与えた！`,
          sender: "player",
        });
      }
      
      setWrongAttempts(0);
      
      // 敵が倒されたかチェック
      if (targetEnemy.defeated) {
        setMessage({
          text: `${targetEnemy.name} を倒した。`,
          sender: "system",
        });
        
        // 次のターゲットを探す
        const nextIndex = findNextAliveEnemyIndex(targetIndex, currentEnemies);
        if (nextIndex !== -1) {
          setTargetIndex(nextIndex);
        }
      } else {
        // 次の問題を取得
        setCurrentQuestion(targetEnemy.getNextQuestion());
      }
      
      // ステージが完了したかチェック
      checkStageCompletion();
    } else {
      // 不正解の場合
      setComboCount(0);
      setWrongAttempts((prev) => prev + 1);
      setMessage({
        text: "間違い！正しい解答を入力してください！",
        sender: "system",
      });
    }
  };

  // すべての敵が倒されたかチェック
  const checkStageCompletion = () => {
    const allDefeated = currentEnemies.every((enemy) => enemy.defeated);
    if (allDefeated) {
      const totalEXP = currentEnemies.reduce(
        (sum, enemy) => sum + enemy.exp,
        0
      );
      gainEXP(totalEXP);
      
      setMessage({
        text: `全ての敵を倒した！${totalEXP} EXPを獲得しました。Enterキーで次のステージに進む。`,
        sender: "system",
      });
      
      setTimeout(() => {
        setReadyForNextStage(true);
      }, 2000);
    }
  };

  // プレイヤーに経験値を付与
  const gainEXP = (amount: number) => {
    setExpGain(amount);
    setTimeout(() => setExpGain(null), EXP_GAIN_DISPLAY_DURATION);
    setPlayer((prev) => prev.addExp(amount));
  };

  // 新しい戦闘ステージを生成
  const spawnNewStage = () => {
    const stage = stages[Math.floor(Math.random() * stages.length)];
    
    const enemies = stage.enemies.map((enemyData, index) => {
      const enemyInstance = new EnemyModel(enemyData);
      enemyInstance.positionOffset = stage.positions[index] || { x: 0, y: 0 };
      return enemyInstance;
    });

    setCurrentEnemies(enemies);
    setTargetIndex(0);
    setMessage({ text: `${stage.id} が始まった！`, sender: "system" });
  };

  // ターゲット選択の処理
  const handleSelectTarget = (index: number) => {
    setTargetIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // 死亡後のゲーム継続処理
  const handleContinueGame = () => {
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
    if (currentEnemies.every(enemy => enemy.defeated)) {
      spawnNewStage();
    }
  };

  // プレイヤーが死亡したらゲームオーバー画面を表示
  if (player.hp <= 0) {
    return (
      <GameOver 
        totalEXP={player.totalExp} 
        onContinue={handleContinueGame}
      />
    );
  }

  return (
    <div
      className={`w-full flex flex-col ${
        isScreenHit ? "screen-flash-shake" : isScreenShake ? "screen-shake" : ""
      }`}
    >
      {/* BattleInterface */}
      <div
        className={`${
          isKeyboardVisible
            ? "flex-[0.7]" // キーボード表示時は70%の高さ
            : "flex-[0.55]" // 通常時は55%の高さ
        } bg-gray-900 transition-all duration-300`}
      >
        <BattleInterface
          player={player}
          onSubmit={handlePlayerAttack}
          expGain={expGain}
          inputRef={inputRef}
          isKeyboardVisible={isKeyboardVisible}
        />
      </div>

      {/* BattleStage */}
      <div
        className={`relative ${
          isKeyboardVisible
            ? "flex-[0.4]" // キーボード表示時は40%の高さ
            : "flex-[0.45]" // 通常時は45%の高さ
        } overflow-hidden transition-all duration-300`}
      >
        <BattleStage
          currentEnemies={currentEnemies}
          targetIndex={targetIndex}
          player={player}
          onEnemyAttack={handleEnemyAttack}
          message={message}
          currentQuestion={currentQuestion}
          wrongAttempts={wrongAttempts}
          enemyHitFlags={enemyHitFlags}
          enemyAttackFlags={enemyAttackFlags}
          enemyFireFlags={enemyFireFlags}
          damageNumbers={damageNumbers}
          onFullRevealChange={setIsHintFullyRevealed}
          onSelectTarget={handleSelectTarget}
          comboCount={comboCount}
          showCombo={showCombo}
          isKeyboardVisible={isKeyboardVisible}
        />

        {/* レベルアップ通知 */}
        {showLevelUp && (
          <LevelUpNotifier
            player={player}
            onClose={() => setShowLevelUp(false)}
          />
        )}

        {/* 次のステージボタン */}
        {readyForNextStage && !showLevelUp && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => {
                spawnNewStage();
                setReadyForNextStage(false);
              }}
              className={`${
                isKeyboardVisible
                  ? "px-2 py-1 text-sm" // キーボード表示時は小さく
                  : "px-4 py-2" // 通常時は大きく
              } bg-red-600 text-white rounded shadow hover:bg-blue-700 transition-colors`}
            >
              次の敵に進む
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;