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
  EXP_GAIN_DISPLAY_DURATION,
  ENEMY_HIT_ANIMATION_DURATION,
  PLAYER_HIT_ANIMATION_DURATION,
  PLAYER_FIREBREATH_ANIMATION_DURATION,
  COMBO_ANIMATION_DURATION,
} from "./data/constants";
import { stages } from "./data/stages";
import LevelUpNotifier from "./components/LevelUpNotifier";

const App: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // キーボード表示状態を管理
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const lastViewportHeight = useRef(window.innerHeight);

  // キーボード表示状態を検出
  useEffect(() => {
    const detectKeyboard = () => {
      // モバイルデバイスでのキーボード検出
      // キーボードが表示されるとビューポートの高さが小さくなる
      if (window.innerHeight < lastViewportHeight.current * 0.8) {
        setIsKeyboardVisible(true);
      } else {
        setIsKeyboardVisible(false);
      }
      lastViewportHeight.current = window.innerHeight;
    };

    window.addEventListener("resize", detectKeyboard);
    return () => window.removeEventListener("resize", detectKeyboard);
  }, []);

  // 入力フィールドのフォーカス検出 - blur()を呼び出さないよう修正
  useEffect(() => {
    const handleFocus = () => setIsKeyboardVisible(true);
    // blurイベントは以前のようにキーボードを閉じさせないため、無効化または削除

    if (inputRef.current) {
      inputRef.current.addEventListener("focus", handleFocus);
      // blurイベントリスナーは削除
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("focus", handleFocus);
        // blurイベントリスナーは削除
      }
    };
  }, [inputRef.current]);

  // キーボード表示中に画面をロックする処理は残す
  useEffect(() => {
    if (isKeyboardVisible) {
      document.body.classList.add("keyboard-open");
      // スクロールを固定
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("keyboard-open");
      document.body.style.overflow = "";
    }
  }, [isKeyboardVisible]);

  // プレイヤーはPlayerクラスのインスタンスで管理
  const [player, setPlayer] = useState<PlayerModel>(
    PlayerModel.createDefault()
  );
  const [isScreenHit, setIsScreenHit] = useState<boolean>(false);
  // 敵については、初期状態をnullにしておく
  const [message, setMessage] = useState<MessageType | null>({
    text: "問題に正しく回答して敵を倒せ！",
    sender: "system",
  });
  const [expGain, setExpGain] = useState<number | null>(null);
  //const [showExpBar, setShowExpBar] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [readyForNextStage, setReadyForNextStage] = useState(false);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);

  const questionTimeoutRef = useRef<number | null>(null);
  // 毒の場合は毒タイマー
  const poisonTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // プレイヤーの最新情報を保持するための ref
  const playerRef = useRef(player);
  const prevLevelRef = useRef(player.level);

  useEffect(() => {
    if (player.level > prevLevelRef.current) {
      setShowLevelUp(true);
    }
    prevLevelRef.current = player.level;
  }, [player.level]);

  const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
  );
  useEffect(() => {
    playerRef.current = player;
  }, [player]);

  // 敵の攻撃アニメーションを管理するフラグ
  const [enemyAttackFlags, setEnemyAttackFlags] = useState<boolean[]>([]);
  const [enemyFireFlags, setEnemyFireFlags] = useState<boolean[]>([]);
  type DamageDisplay = {
    value: number;
    id: number;
  };
  // 敵のグラフィックにダメージを表示するための変数
  const [damageNumbers, setDamageNumbers] = useState<(DamageDisplay | null)[]>(
    []
  );
  // プレーヤーが敵に攻撃した場合を識別するフラグ
  const [enemyHitFlags, setEnemyHitFlags] = useState<boolean[]>([]);
  const [showLevelUp, setShowLevelUp] = useState(false);
  // 攻撃を受けた時の画面エフェクトを切り替えるフラグ
  const [isScreenShake, setIsScreenShake] = useState<boolean>(false);

  const [comboCount, setComboCount] = useState<number>(0);
  const [showCombo, setShowCombo] = useState<boolean>(false);
  useEffect(() => {
    // COMBO_ANIMATION_DURATION が 1000 の場合 "1000ms" として設定
    document.documentElement.style.setProperty(
      "--combo-animation-duration",
      `${COMBO_ANIMATION_DURATION}ms`
    );
  }, []);

  useEffect(() => {
    setDamageNumbers(currentEnemies.map(() => null));
  }, [currentEnemies]);

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
      setPlayer((prev) => prev.takeDamage(poisonEffect.damagePerTick));
    }, 1000); // 1秒ごとに実行

    // ticks 秒後に毒のタイマーを停止
    setTimeout(() => {
      console.log("handlePoisonAttack: setTimeout 実行中");
      clearInterval(poisonTimerRef.current!);
      setPlayer((prev) => prev.removeStatusEffects("poison"));
      poisonTimerRef.current = null;
    }, ticks * 1000);
  };

  // Modified handleEnemyAttack function for App.tsx
  const handleEnemyAttack = useCallback(
    (attackingEnemy: EnemyModel) => {
      // isScreenShakeのステートが必要
      // const [isScreenShake, setIsScreenShake] = useState<boolean>(false);
      if (attackingEnemy === undefined) return;
      // 敵が既に倒れているなら攻撃処理をしない
      if (attackingEnemy.currentHP <= 0) return;
      // 敵の攻撃を実行。performAttackは敵の特攻攻撃ロジックも含む
      // playerを直接指定して、playerを監視にするとAppコンポーネントが再レンダリングされてしまい、攻撃インジケータがリセットされる不具合発生するため、useRef取得したplayerを使う
      const attack = attackingEnemy.performAttack(playerRef.current);
      let damageToApply: number;
      let specialMessage = "";
      let isCritical = false; // クリティカルヒットのフラグを追加

      // 特殊攻撃を受けた場合の処理
      if (attack.special) {
        // ステータス異常を付与
        setPlayer((prev) =>
          prev.applyStatusEffects(attack.result.statusEffects)
        );
        // ステータス異常（毒効果）
        const poisonEffect = attack.result.statusEffects.find(
          (e) => e.type === "poison"
        );
        if (poisonEffect) {
          console.log("毒攻撃を受けました");
          handlePoisonAttack(poisonEffect);
        }
        if (attack.special === "fire breath") {
          console.log("特殊攻撃: fire breath");
          // 炎攻撃のアニメーション
          triggerEnemyAttackAnimation(
            setEnemyFireFlags,
            attackingEnemy,
            PLAYER_FIREBREATH_ANIMATION_DURATION
          );
        }
        // ステータス異常（...） 今後追加予定
        // if (  ) {}

        // 特殊攻撃の場合は、特殊攻撃のメッセージを表示
        specialMessage = `${attack.result.message}`;
        damageToApply = attack.result.damage;
        const effect_message = `${specialMessage}`;
        const damage_message =
          damageToApply != 0 ? `${damageToApply}のダメージ！` : "";
        setMessage({ text: effect_message + damage_message, sender: "enemy" });
      } else {
        // 攻撃する敵のアニメーションフラグだけを更新
        triggerEnemyAttackAnimation(
          setEnemyAttackFlags,
          attackingEnemy,
          PLAYER_HIT_ANIMATION_DURATION
        );
        damageToApply = attack.result.damage;

        // クリティカルヒットの判定 (敵のluck値を基に計算)
        // 基本クリティカル率: 5% + luck値に応じたボーナス
        const baseCritRate = 0.05;
        const luckBonus = (attackingEnemy.luck || 0) * 0.01; // luck 1につき1%増加
        const criticalRate = baseCritRate + luckBonus;

        if (Math.random() < criticalRate) {
          isCritical = true;
          // クリティカルヒットの場合は、防御力を無視して攻撃力の1.5倍のダメージを計算し直す
          // ±10%のランダム変動を追加する
          const randomFactor = 0.9 + Math.random() * 0.2; // 0.9～1.1のランダム値
          const baseDamage = attackingEnemy.attackPower * 1.5;
          damageToApply = Math.floor(baseDamage * randomFactor);

          // クリティカルダメージの変動の表現を追加
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
          // 通常攻撃の場合のメッセージ
          setMessage({
            text: `${attackingEnemy.name} の攻撃！ ${damageToApply} のダメージ！`,
            sender: "enemy",
          });
        }
      }
      // ダメージを受ける処理
      setPlayer((prev) => prev.takeDamage(damageToApply));

      // 画面エフェクトの処理
      // 攻撃がミスまたはダメージが0の場合はエフェクトなし
      if (damageToApply <= 0) {
        // エフェクトなし
      }
      // クリティカルの場合はフラッシュして揺らす
      else if (isCritical) {
        setIsScreenHit(true);
        setTimeout(() => {
          setIsScreenHit(false);
        }, 500);
      }
      // 通常攻撃（ダメージあり）の場合は揺らすのみ
      else {
        // 画面を揺らすだけのエフェクトを適用するためのstate
        setIsScreenShake(true);
        setTimeout(() => {
          setIsScreenShake(false);
        }, 500);
      }
    },
    [currentEnemies, playerRef]
  );

  // 攻撃する敵のアニメーションフラグを更新
  const triggerEnemyAttackAnimation = (
    setFunction: React.Dispatch<React.SetStateAction<boolean[]>>,
    attackingEnemy: EnemyModel,
    duration: number
  ) => {
    const index = currentEnemies.findIndex((e) => e === attackingEnemy);
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

  // 次の生存している敵のインデックスを返す関数。見つからなければ -1 を返す。
  const findNextAliveEnemyIndex = (
    startIndex: number,
    enemies: EnemyModel[]
  ): number => {
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
        setCurrentQuestion(
          targetEnemy.presentedQuestion || targetEnemy.getNextQuestion()
        );
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

    const trimmedInput = input.trim();

    if (trimmedInput.toLowerCase() === currentQuestion.answer.toLowerCase()) {
      // 正解の場合 → combo数を更新（前回のコンボに1加算）
      const newCombo = comboCount + 1;
      setComboCount(newCombo);
      setShowCombo(true);
      setTimeout(() => setShowCombo(false), COMBO_ANIMATION_DURATION);

      const { damage, specialMessage } = calculateEffectiveDamage(
        currentQuestion,
        newCombo
      ); // プレイヤー攻撃計算
      targetEnemy.takeDamage(damage);

      // 新しい識別子を生成してダメージを設定
      const newDamage: DamageDisplay = { value: damage, id: Date.now() };

      // 敵のダメージ表示用stateを更新する
      setDamageNumbers((prev) => {
        const newArr = [...prev];
        newArr[targetIndex] = newDamage;
        return newArr;
      });
      // 既存のタイマーをキャンセルしてから、新しいタイマーで消去
      setTimeout(() => {
        setDamageNumbers((prev) => {
          const newArr = [...prev];
          newArr[targetIndex] = null;
          return newArr;
        });
      }, 1000);

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
      // 敵のHPが0担った場合は、defeatedフラグを立てる
      if (targetEnemy.defeated) {
        setMessage({
          text: `${targetEnemy.name} を倒した。`,
          sender: "system",
        });
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
      // 不正解の場合 → コンボリセット
      setComboCount(0);
      setWrongAttempts((prev) => prev + 1);
      setMessage({
        text: "間違い！正しい解答を入力してください！",
        sender: "system",
      });
    }
  };

  // 全ての敵が倒されたかどうかチェックする関数
  const checkStageCompletion = () => {
    const allDefeated = currentEnemies.every((enemy) => enemy.defeated);
    if (allDefeated) {
      const totalEXP = currentEnemies.reduce(
        (sum, enemy) => sum + enemy.exp,
        0
      );
      gainEXP(totalEXP);
      console.log("倒した！");
      setMessage({
        text: `全ての敵を倒した！${totalEXP} EXPを獲得しました。Enterキーで次のステージに進む。`,
        sender: "system",
      });
      setTimeout(() => {
        setReadyForNextStage(true);
      }, 2000);
    }
  };

  // ダメージ計算関数
  function calculateEffectiveDamage(currentQuestion: Question, combo: number) {
    const targetEnemy = currentEnemies[targetIndex];

    // 基本ダメージ：プレイヤーの攻撃力から敵の防御力を差し引いた値（最低5）
    const baseDamage = Math.max(5, player.attack - targetEnemy.defense);
    console.log("baseDamage: ", baseDamage);

    // ランダムな変動（+-10%）
    const randomFactor = 0.9 + Math.random() * 0.2; // 0.9〜1.1
    let damage = baseDamage * randomFactor;

    // ヒントに基づく補正
    const answerNoSpaces = currentQuestion.answer.replace(/\s/g, "");
    const maxHints = answerNoSpaces.length;
    const effectiveWrongAttempts = isHintFullyRevealed
      ? maxHints
      : wrongAttempts;
    const hintFraction = effectiveWrongAttempts / maxHints;
    // ヒントが全て表示されているときは倍率が0.5、表示されていなければ1.0
    const multiplier = 1 - hintFraction / 2;
    damage *= multiplier;

    // プレイヤーと敵のパラメータを取得（存在しなければ0とする）
    const playerLuck = player.luck || 0;
    const playerPower = player.power || 0;
    const enemyLuck = targetEnemy.luck || 0;
    const enemySpeed = targetEnemy.speed || 0;

    // クリティカルとミスの確率を計算
    // 例として、基本ミス確率5%に敵のluckとspeedによる影響、クリティカルは基本5%にプレイヤーのluckとpowerの影響
    const missProbability = Math.min(
      0.01 + (enemyLuck + enemySpeed) * 0.005,
      0.1
    );
    const critProbability = Math.min(
      0.01 + (playerLuck + playerPower) * 0.005,
      0.15
    );

    // ヒントが完全に開かれている場合、クリティカル発生は無効にする。
    const effectiveCritProbability = isHintFullyRevealed ? 0 : critProbability;

    const rand = Math.random();
    let specialMessage = "";

    // 攻撃ミスをまずチェック
    if (rand < missProbability) {
      damage = 0;
      specialMessage = "ミス！";
    } else if (rand < missProbability + effectiveCritProbability) {
      // クリティカルの場合は、敵の防御力を無視し、さらに大きな倍率（ここでは1.5倍）をかける
      damage = Math.floor(player.attack * randomFactor * 1.5);
      specialMessage = "クリティカル！";
    } else {
      damage = Math.floor(damage);
    }

    // コンボによる攻撃力アップ（毎回1.1%アップ）
    damage = Math.floor(damage * (1 + combo * 0.011));

    return { damage, effectiveWrongAttempts, multiplier, specialMessage };
  }

  const gainEXP = (amount: number) => {
    setExpGain(amount);
    setTimeout(() => setExpGain(null), EXP_GAIN_DISPLAY_DURATION);
    setPlayer((prev) => prev.addExp(amount));
    //setShowExpBar(true);
  };

  const spawnNewStage = () => {
    // 今回はステージをランダムに選択する
    const stage = stages[Math.floor(Math.random() * stages.length)];
    // ステージの配置情報を利用して各敵に positionOffset を設定する
    const enemies = stage.enemies.map((enemyData, index) => {
      const enemyInstance = new EnemyModel(enemyData);
      console.log("enemyInstance", enemyInstance);
      enemyInstance.positionOffset = stage.positions[index] || { x: 0, y: 0 };
      return enemyInstance;
    });

    setCurrentEnemies(enemies);
    // ターゲットは最初の敵に設定
    setTargetIndex(0);

    // メッセージ更新などの処理
    setMessage({ text: `${stage.id} が始まった！`, sender: "system" });
  };

  // キーボードが表示されても画面を固定する機能を追加
  useEffect(() => {
    // iOS での自動スクロールを防止する関数
    const preventScroll = () => {
      // 現在のスクロール位置を保存
      const scrollPos = window.scrollY;

      // スクロールイベントが発生したら強制的に元の位置に戻す
      const handleScroll = () => {
        window.scrollTo(0, scrollPos);
      };

      // フォーカス時にスクロールイベントリスナーを追加
      const handleFocus = () => {
        document.body.classList.add("keyboard-open");
        window.addEventListener("scroll", handleScroll);

        // スクロール位置を少し遅延して修正（キーボードが表示された後）
        setTimeout(() => {
          window.scrollTo(0, 0);
        }, 100);
      };

      // フォーカスが外れたときにスクロールイベントリスナーを削除
      const handleBlur = () => {
        document.body.classList.remove("keyboard-open");
        window.removeEventListener("scroll", handleScroll);
      };

      // 入力フィールドにイベントリスナーを追加
      if (inputRef.current) {
        inputRef.current.addEventListener("focus", handleFocus);
        inputRef.current.addEventListener("blur", handleBlur);
      }

      return () => {
        // クリーンアップ
        if (inputRef.current) {
          inputRef.current.removeEventListener("focus", handleFocus);
          inputRef.current.removeEventListener("blur", handleBlur);
        }
        window.removeEventListener("scroll", handleScroll);
      };
    };

    // モバイルデバイスのみで適用
    if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
      preventScroll();
    }
  }, [inputRef.current]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // shift+tabでターゲットを反時計回転で選択
      if (event.key === "Tab" && event.shiftKey) {
        event.preventDefault(); // Shift+Tab のデフォルト動作を無効化
        if (currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
          setTargetIndex((prev) => {
            // 再帰的に前の生存している敵のインデックスを探す関数
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
      // Tabキーで時計回転にターゲットを選択
      else if (event.key === "Tab") {
        event.preventDefault(); // タブキーのデフォルト動作を無効化
        if (currentEnemies.filter((enemy) => !enemy.defeated).length > 1) {
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
      } else if (event.key === "Enter" && readyForNextStage) {
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
  const handleSelectTarget = (index: number) => {
    setTargetIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={`w-full h-screen flex flex-col ${isScreenHit ? "screen-flash-shake" : isScreenShake ? "screen-shake" : ""}`}>
      {/* BattleStage - キーボード表示時の比率をさらに調整 */}
      <div 
        className={`relative ${
          isKeyboardVisible 
            ? 'flex-[0.4]' // キーボード表示時は30%に調整（以前は25%）
            : 'flex-[0.45]' // 通常は変更なし
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
        
        {/* LevelUp Notifier */}
        {showLevelUp && (
          <LevelUpNotifier player={player} onClose={() => setShowLevelUp(false)} />
        )}
        
        {/* Next Stage Button */}
        {readyForNextStage && !showLevelUp && (
          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-50">
            <button
              onClick={() => {
                spawnNewStage();
                setReadyForNextStage(false);
              }}
              className={`${
                isKeyboardVisible 
                  ? 'px-2 py-1 text-sm' // キーボード表示時は小さく
                  : 'px-4 py-2'
              } bg-red-600 text-white rounded shadow hover:bg-blue-700 transition-colors`}
            >
              次の敵に進む
            </button>
          </div>
        )}
      </div>
      
      {/* BattleInterface - キーボード表示時の比率をさらに調整 */}
      <div className={`${
        isKeyboardVisible 
          ? 'flex-[0.7]' // キーボード表示時は70%に調整（以前は75%）
          : 'flex-[0.55]' // 通常は変更なし
      } bg-gray-900 transition-all duration-300`}>
        <BattleInterface
          player={player}
          onSubmit={handlePlayerAttack}
          expGain={expGain}
          inputRef={inputRef}
          isKeyboardVisible={isKeyboardVisible}
        />
      </div>
    </div>
  );
};

export default App;
