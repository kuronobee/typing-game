// src/App.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import { commonQuestions, Question } from "./data/questions";
import { Player as PlayerModel, StatusEffect } from "./models/Player";
import { Enemy as EnemyModel } from "./models/EnemyModel"; // 新しく作成したEnemyクラス
import { MessageType } from "./components/MessageDisplay";
import {
  LEVEL_UP_MESSAGE_DURATION,
  EXP_GAIN_DISPLAY_DURATION,
  INPUT_FOCUS_DELAY,
  ENEMY_HIT_ANIMATION_DURATION,
  PLAYER_HIT_ANIMATION_DURATION,
  PLAYER_FIREBREATH_ANIMATION_DURATION,
} from "./data/constants";
import { stages } from "./data/stages";
import LevelUpNotifier from "./components/LevelUpNotifier";

const App: React.FC = () => {
  // プレイヤーはPlayerクラスのインスタンスで管理
  const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());

  // 敵については、初期状態をnullにしておく
  const [message, setMessage] = useState<MessageType | null>({ text: "問題に正しく回答して敵を倒せ！", sender: "system" });
  const [expGain, setExpGain] = useState<number | null>(null);
  const [levelUpMessage, setLevelUpMessage] = useState<React.ReactNode>(null);
  const [showExpBar, setShowExpBar] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [showQuestion, setShowQuestion] = useState(true);
  const [readyForNextStage, setReadyForNextStage] = useState(false);
  // 問題のラウンド数
  const [round, setRound] = useState(1);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);

  // プレイヤー攻撃時のアニメーション管理用フラグ
  const [enemyHit, setEnemyHit] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const questionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // 毒の場合は毒タイマー
  const poisonTimerRef = useRef<NodeJS.Timeout | null>(null);
  // プレイヤーの最新情報を保持するための ref
  const playerRef = useRef(player);
  const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(commonQuestions[Math.floor(Math.random() * commonQuestions.length)]);
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // 敵の攻撃アニメーションを管理するフラグ
  const [enemyAttackFlags, setEnemyAttackFlags] = useState<boolean[]>([]);
  const [enemyFireFlags, setEnemyFireFlags] = useState<boolean[]>([]);

  // プレーヤーが敵に攻撃した場合を識別するフラグ
  const [enemyHitFlags, setEnemyHitFlags] = useState<boolean[]>([]);

  // currentEnemies が更新されたら、フラグ配列も初期化
  useEffect(() => {
    setEnemyAttackFlags(currentEnemies.map(() => false));
    setEnemyFireFlags(currentEnemies.map(() => false));
    setEnemyHitFlags(currentEnemies.map(() => false));
  }, [currentEnemies]);


  // spawnNewStage の定義の後、レンダリング前に追加
  useEffect(() => {
    // 初回マウント時にステージを生成する
    spawnNewStage();
  }, []);

  // 毒攻撃を受けた時に呼ばれる関数
  const handlePoisonAttack = (poisonEffect: StatusEffect) => {
    // すでに毒のタイマーが動作中なら、何もしない
    if (poisonTimerRef.current !== null) {
      console.log("handlePoisonAttack: 毒のタイマーが動作中です");
      return;
    }

    const ticks = poisonEffect.ticks;
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

  const handleEnemyAttack = useCallback((attackingEnemy: EnemyModel) => {
    if (attackingEnemy === undefined) return;
    // 敵が既に倒れているなら攻撃処理をしない
    if (attackingEnemy.currentHP <= 0) return;
    // 敵の攻撃を実行。performAttackは敵の特攻攻撃ロジックも含む
    // playerを直接指定して、playerを監視にするとAppコンポーネントが再レンダリングされてしまい、攻撃インジケータがリセットされる不具合発生するため、useRef取得したplayerを使う
    const attack = attackingEnemy.performAttack(playerRef.current);

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
      if (attack.special === "fire breath") {
        console.log("特殊攻撃: fire breath");
        // 炎攻撃のアニメーション
        triggerEnemyAttackAnimation(setEnemyFireFlags, attackingEnemy, PLAYER_FIREBREATH_ANIMATION_DURATION);
      }
      // ステータス異常（...） 今後追加予定
      // if (  ) {}

      // 特殊攻撃の場合は、特殊攻撃のメッセージを表示
      const effect_message = `${attack.result.message}`;
      const damage_message = attack.result.damage != 0 ? `${attack.result.damage}のダメージ！` : "";
      setMessage({ text: effect_message + damage_message, sender: "enemy" });
    } else {
      // 攻撃する敵のアニメーションフラグだけを更新
      triggerEnemyAttackAnimation(setEnemyAttackFlags, attackingEnemy, PLAYER_HIT_ANIMATION_DURATION);
      // 通常攻撃の場合のメッセージ
      setMessage({ text: `${attackingEnemy.name} の攻撃！ ${attack.result.damage} のダメージ！`, sender: "enemy" });
    }
    // ダメージを受ける処理
    setPlayer(prev => prev.takeDamage(attack.result.damage));
  }, [currentEnemies, playerRef]);

  // 攻撃する敵のアニメーションフラグを更新
  const triggerEnemyAttackAnimation = (
    setFunction: React.Dispatch<React.SetStateAction<boolean[]>>,
    attackingEnemy: EnemyModel,
    duration: number
  ) => {
    const index = currentEnemies.findIndex(e => e === attackingEnemy);
    // まず指定したインデックスの値を true にする
    setFunction((prev) => {
      const newFlags = [...prev];
      newFlags[index] = true;
      return newFlags;
    });
    // 指定した duration (ミリ秒) 後に false に戻す
    setTimeout(() => {
      setFunction((prev) => {
        const newFlags = [...prev];
        newFlags[index] = false;
        return newFlags;
      });
    }, duration);
  };

  const updateQuestion = () => {
    setCurrentQuestion(
      commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
    );
    setRound(prev => prev + 1); // 問題のラウンド数を更新
    setWrongAttempts(0);
  };

  // 次の生存している敵のインデックスを返す関数。見つからなければ -1 を返す。
  const findNextAliveEnemyIndex = (startIndex: number, enemies: EnemyModel[]): number => {
    // 現在のインデックスの次から探索
    for (let i = startIndex + 1; i < enemies.length; i++) {
      if (!enemies[i].defeated) {
        return i;
      }
    }
    // 先頭から現在のインデックスまでを再度探索
    for (let i = 0; i <= startIndex; i++) {
      if (!enemies[i].defeated) {
        return i;
      }
    }
    return -1; // すべて倒れている場合
  };

  // ターゲットの変化により問題を入れかえる
  useEffect(() => {
    if (currentEnemies.length > 0) {
      const targetEnemy = currentEnemies[targetIndex];
      if (targetEnemy && !targetEnemy.defeated) {
        // すでに出題されている問題があればそれを、なければ getNextQuestion() で生成する
        setCurrentQuestion(targetEnemy.presentedQuestion || targetEnemy.getNextQuestion());
        console.log(targetEnemy.presentedQuestion);
      }
    }
  }, [targetIndex, currentEnemies]);

  const handlePlayerAttack = (input: string) => {
    if (!currentEnemies.length) return;
    // ターゲットの敵を取得
    const targetEnemy = currentEnemies[targetIndex];
    if (!targetEnemy || targetEnemy.defeated) return;

    if (!currentQuestion) {
      setCurrentQuestion(targetEnemy.getNextQuestion());
    }

    if (input.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      // 正解の場合
      console.log("正解！");
      const { damage } = calculateEffectiveDamage(currentQuestion); // プレイヤー攻撃計算
      targetEnemy.takeDamage(damage);
      // 攻撃が当たったことをBattleStageに知らせる
      setEnemyHitFlags((prev) => {
        const newFlags = [...prev];
        newFlags[targetIndex] = true;
        return newFlags;
      });
      // 敵に攻撃が当たったアニメーション
      setTimeout(() => {
        setEnemyHitFlags((prev) => {
          const newFlags = [...prev];
          newFlags[targetIndex] = false;
          return newFlags;
        });
      }, ENEMY_HIT_ANIMATION_DURATION);
      setMessage({ text: `正解！${damage} のダメージを与えた！`, sender: "player" });
      setWrongAttempts(0);
      // 敵のHPが0担った場合は、defeatedフラグを立てる
      if (targetEnemy.defeated) {
        setMessage({ text: `${targetEnemy.name} を倒した。`, sender: "system" });
        // TODO：現在画面から消去
        const nextIndex = findNextAliveEnemyIndex(targetIndex, currentEnemies);
        if (nextIndex !== -1) {
          setTargetIndex(nextIndex);
        }
      } else {
        // 次の問題を表示
        setCurrentQuestion(targetEnemy.getNextQuestion());
      }
      // 全摘のdefatedフラグをチェック
      checkStageCompletion();
    } else {
      // 不正解の場合
      setWrongAttempts(prev => prev + 1);
      setMessage({ text: "間違い！正しい解答を入力してください！", sender: "system" });
    }
  }

  // 全ての敵が倒されたかどうかチェックする関数
  const checkStageCompletion = () => {
    const allDefeated = currentEnemies.every(enemy => enemy.defeated);
    if (allDefeated) {
      const totalEXP = currentEnemies.reduce((sum, enemy) => sum + enemy.exp, 0);
      gainEXP(totalEXP);
      console.log("倒した！");
      setMessage({ text: `全ての敵を倒した！${totalEXP} EXPを獲得しました。Enterキーで次のステージに進む。`, sender: "system" });
      setTimeout(() => {
        setReadyForNextStage(true);
      }, 2000);
    }
  }

  // ダメージ計算関数
  function calculateEffectiveDamage(currentQuestion: Question) {
    const targetEnemy = currentEnemies[targetIndex];
    const baseDamage = Math.max(5, player.attack - targetEnemy.defense);
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

  const gainEXP = (amount: number) => {
    setExpGain(amount);
    setTimeout(() => setExpGain(null), EXP_GAIN_DISPLAY_DURATION);
    setPlayer(prev => prev.addExp(amount));
    setShowExpBar(true);
  };

  // 前回のプレイヤー状態を保持する ref
  const prevPlayerRef = useRef(player);

  useEffect(() => {
    if (prevPlayerRef.current.level !== player.level) {
      const diffHP = player.maxHP - prevPlayerRef.current.maxHP;
      const diffMP = player.maxMP - prevPlayerRef.current.maxMP;
      const diffAttack = player.attack - prevPlayerRef.current.attack;
      const diffDefense = player.defense - prevPlayerRef.current.defense;
      const diffMagicDefense = player.magicDefense - prevPlayerRef.current.magicDefense;
      const diffSpeed = player.speed - prevPlayerRef.current.speed;
      showLevelUpMessage(diffHP, diffMP, diffAttack, diffDefense, diffMagicDefense, diffSpeed);
      prevPlayerRef.current = player;
    }
  }, [player]);

  const showLevelUpMessage = (
    diffHP: number,
    diffMP: number,
    diffAttack: number,
    diffDefense: number,
    diffMagicDefense: number,
    diffSpeed: number
  ) => {
    const msg = (
      <div>
        <div className="font-bold text-xl mb-2">レベルアップ！ (Lv.{player.level})</div>
        <table className="mx-auto text-left">
          <tbody>
            <tr>
              <td>HP：</td>
              <td>
                {player.maxHP}{" "}
                <span className="text-green-500">
                  (+{diffHP})
                </span>
              </td>
            </tr>
            <tr>
              <td>MP：</td>
              <td>
                {player.maxMP}{" "}
                <span className="text-green-500">
                  (+{diffMP})
                </span>
              </td>
            </tr>
            <tr>
              <td>攻撃：</td>
              <td>
                {player.attack}{" "}
                <span className="text-green-500">
                  (+{diffAttack})
                </span>
              </td>
            </tr>
            <tr>
              <td>防御：</td>
              <td>
                {player.defense}{" "}
                <span className="text-green-500">
                  (+{diffDefense})
                </span>
              </td>
            </tr>
            <tr>
              <td>魔法防御：</td>
              <td>
                {player.magicDefense}{" "}
                <span className="text-green-500">
                  (+{diffMagicDefense})
                </span>
              </td>
            </tr>
            <tr>
              <td>スピード：</td>
              <td>
                {player.speed}{" "}
                <span className="text-green-500">
                  (+{diffSpeed})
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    setLevelUpMessage(msg);
    setTimeout(() => {
      setLevelUpMessage(null);
      setShowExpBar(false);
    }, LEVEL_UP_MESSAGE_DURATION);
  };

  const spawnNewStage = () => {
    // 今回はステージをランダムに選択する
    const stage = stages[Math.floor(Math.random() * stages.length)];
    // ステージの配置情報を利用して各敵に positionOffset を設定する
    const enemies = stage.enemies.map((enemyData, index) => {
      const enemyInstance = new EnemyModel(enemyData);
      enemyInstance.positionOffset = stage.positions[index] || { x: 0, y: 0 };
      return enemyInstance;
    });

    setCurrentEnemies(enemies);
    // ターゲットは最初の敵に設定
    setTargetIndex(0);

    // メッセージ更新などの処理
    setMessage({ text: `${stage.id} が始まった！`, sender: "system" });

  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        event.preventDefault(); // タブキーのデフォルト動作を無効化
        if (currentEnemies.filter(enemy => !enemy.defeated).length > 1) {
          setTargetIndex((prev) => {
            // 再帰的に次の生存敵のインデックスを探す関数
            const findNextAliveIndex = (index: number): number => {
              const newIndex = (index + 1) % currentEnemies.length;
              // もし戻ってきたら、すべて倒れている可能性があるので、そのまま返す
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

      else if (event.key === "Enter" && readyForNextStage) {
        spawnNewStage();
        setReadyForNextStage(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [readyForNextStage, currentEnemies]);

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
  if (currentEnemies.length === 0) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-screen flex flex-col">
      <div className="relative flex-1">
        <BattleStage
          currentEnemies={currentEnemies}
          targetIndex={targetIndex}
          player={player} // player オブジェクトを渡す
          onEnemyAttack={handleEnemyAttack}
          message={message}
          currentQuestion={currentQuestion}
          wrongAttempts={wrongAttempts}
          enemyHitFlags={enemyHitFlags}
          enemyAttackFlags={enemyAttackFlags}
          enemyFireFlags={enemyFireFlags}
          showQuestion={showQuestion}
          round={round}
          onFullRevealChange={setIsHintFullyRevealed}
        />
        {/* levelUpNotifierを表示 */}
        <LevelUpNotifier player={player} />
        {readyForNextStage && (
          <div className="absolute bottom-50 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => {
                spawnNewStage();
                setReadyForNextStage(false);
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
