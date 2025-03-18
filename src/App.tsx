// src/App.tsx
import React, { useState, useEffect, useRef } from "react";
import BattleStage from "./components/BattleStage";
import BattleInterface from "./components/BattleInterface";
import GameOver from "./components/GameOver";
import LevelUpNotifier from "./components/LevelUpNotifier";
import CombatEffects from "./components/CombatEffects";
import NextStageButton from "./components/NextStageButton";

import { commonQuestions, Question } from "./data/questions";
import { Player as PlayerModel } from "./models/Player";
import { Enemy as EnemyModel } from "./models/EnemyModel";
import { MessageType } from "./components/MessageDisplay";
import { ENEMY_HIT_ANIMATION_DURATION } from "./data/constants";

// カスタムフックのインポート
import useKeyboardVisibility from "./hooks/useKeyboardVisibility";
import useIOSScrollPrevention from "./hooks/useIOSScrollPrevention";
import { useCombatSystem } from "./hooks/useCombatSystem";
import { usePlayerAttack } from "./hooks/usePlayerAttack";
//import { useLevelTracking } from "./hooks/useLevelTracking";

// マネージャークラスのインポート
import { StageManager } from "./managers/StageManager";
import { ExperienceManager } from "./managers/ExperienceManager";

// インポート
import SkillManagement from "./components/SkillManagement";
import { SkillInstance } from "./models/Skill";
import {
  createSkillInstance,
  skillData,
  initialPlayerSkills,
} from "./data/skillData";
import SkillEffect from "./components/SkillEffect";
import FireSkillEffect from "./components/FireSkillEffect";

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
  const [player, setPlayer] = useState<PlayerModel>(
    PlayerModel.createDefault()
  );

  // 戦闘関連の状態
  const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
  const [targetIndex, setTargetIndex] = useState<number>(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question>(
    commonQuestions[Math.floor(Math.random() * commonQuestions.length)]
  );
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);
  const [comboCount, setComboCount] = useState<number>(0);
  const [readyForNextStage, setReadyForNextStage] = useState(false);

  // UI状態
  const [message, setMessage] = useState<MessageType | null>(null);

  const [expGain, setExpGain] = useState<number | null>(null);

  // タイマーと追跡用のref
  const questionTimeoutRef = useRef<number | null>(null);

  const [isDead, setIsDead] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);

  // スキル関連の変数
  const [activeSkill, setActiveSkill] = useState<SkillInstance | null>(null);
  const [equippedSkills, setEquippedSkills] = useState<
    (SkillInstance | null)[]
  >([]);
  const [availableSkillIds, setAvailableSkillIds] =
    useState<string[]>(initialPlayerSkills);
  const [showSkillManagement, setShowSkillManagement] = useState(false);
  const [skillEffect, setSkillEffect] = useState<{
    type: "heal" | "damage" | "buff" | "debuff";
    targetPosition?: { x: number; y: number };
    value?: number;
    skillName?: string;
  } | null>(null);

  // FireSkillEffectの状態を管理する
  const [fireSkillEffect, setFireSkillEffect] = useState<{
    skillName: string;
    targetPosition: { x: number; y: number };
    damageValue?: number;
    power: "low" | "medium" | "high";
  } | null>(null);

  // 2. 炎系スキル表示関数を追加
  // 炎系スキルのエフェクトを表示する関数
  const showFireSkillEffect = (
    skillName: string,
    targetPosition: { x: number; y: number },
    damageValue?: number,
    power: "low" | "medium" | "high" = "medium"
  ) => {
    // 画面効果を追加（オプション）
    document.body.classList.add("fire-skill-flash");
    setTimeout(() => {
      document.body.classList.remove("fire-skill-flash");
    }, 500);

    // エフェクト状態を設定
    setFireSkillEffect({
      skillName,
      targetPosition,
      damageValue,
      power,
    });

    // 敵へのヒット後に火のオーラエフェクトを追加（オプション）
    if (targetPosition && damageValue) {
      setTimeout(() => {
        // 対象の敵要素に一時的にfire-auraクラスを追加
        const enemyElements = document.querySelectorAll(".enemy-container");
        if (enemyElements.length > 0) {
          // ターゲットインデックスに応じた敵要素を取得
          const targetEnemyElement = enemyElements[targetIndex];
          if (targetEnemyElement) {
            targetEnemyElement.classList.add("fire-aura");
            setTimeout(() => {
              targetEnemyElement.classList.remove("fire-aura");
            }, 1500);
          }
        }
      }, 600); // 火球が命中した後にエフェクト追加
    }
  };

  // 初回マウント時の初期化
  useEffect(() => {
    // 初期スキルをセットアップ
    const initialSkillsArray = initialPlayerSkills.map((skillId) => {
      try {
        return createSkillInstance(skillId);
      } catch (error) {
        console.error(`Error creating skill instance for ${skillId}:`, error);
        return null;
      }
    });

    // 3スロット分のスキル配列を用意（空きスロットはnull）
    const skillsWithEmptySlots = [...initialSkillsArray];
    while (skillsWithEmptySlots.length < 3) {
      skillsWithEmptySlots.push(null);
    }

    setEquippedSkills(skillsWithEmptySlots);
  }, []);

  // 新しいスキルの獲得（レベルアップなどで取得する場合）
  const acquireNewSkill = (skillId: string) => {
    if (!availableSkillIds.includes(skillId)) {
      setAvailableSkillIds((prev) => [...prev, skillId]);
      setMessage({
        text: `新しいスキル「${
          skillData.find((s) => s.id === skillId)?.name
        }」を習得した！`,
        sender: "system",
      });
    }
  };
  void acquireNewSkill;

  // スキル装備の処理
  const handleEquipSkill = (skillId: string, slotIndex: number) => {
    try {
      const newSkill = createSkillInstance(skillId);

      setEquippedSkills((prev) => {
        const newSkills = [...prev];
        newSkills[slotIndex] = newSkill;
        return newSkills;
      });
    } catch (error) {
      console.error(`Error equipping skill ${skillId}:`, error);
      setMessage({
        text: "スキルの装備に失敗しました",
        sender: "system",
      });
    }
  };

  // スキル解除の処理
  const handleUnequipSkill = (slotIndex: number) => {
    setEquippedSkills((prev) => {
      const newSkills = [...prev];
      newSkills[slotIndex] = null;
      return newSkills;
    });
  };

  // スキルエフェクトの表示処理
  const showSkillEffectAnimation = (
    type: "heal" | "damage" | "buff" | "debuff",
    targetPosition?: { x: number; y: number },
    value?: number,
    skillName?: string
  ) => {
    setSkillEffect({ type, targetPosition, value, skillName });

    // スキル使用時のスクリーンエフェクト（オプション）
    if (type === "damage") {
      // ダメージスキルはスクリーンシェイク
      combat.isScreenShake = true;
      setTimeout(() => {
        combat.isScreenShake = false;
      }, 500);
    } else if (type === "heal") {
      // 回復スキルは明るくフラッシュ（CombatEffectsに新しいメソッドが必要）
      document.body.classList.add("heal-flash");
      setTimeout(() => {
        document.body.classList.remove("heal-flash");
      }, 500);
    }
    // 必要に応じてここでサウンド効果や画面シェイクなども追加可能
  };

  // レベルアップ追跡フック
  const [showLevelUp, setShowLevelUp] = useState(false);

  // 戦闘システムフック
  const combat = useCombatSystem(player, setPlayer, currentEnemies, setMessage);

  // プレイヤー更新時のrefを更新
  useEffect(() => {
    combat.updatePlayerRef();
  }, [player, combat.updatePlayerRef]);

  // 敵が変わったときにアニメーション配列を初期化
  useEffect(() => {
    combat.initializeAnimations();
  }, [currentEnemies, combat.initializeAnimations]);

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

  // プレイヤー攻撃フック
  const playerAttack = usePlayerAttack(
    player,
    setComboCount,
    setWrongAttempts,
    setMessage,
    isHintFullyRevealed
  );

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

  // プレイヤーが敵を攻撃する処理
  // プレイヤーの攻撃処理を修正（アクティブスキルの処理を追加）
  const handlePlayerAttack = (input: string) => {
    if (!currentEnemies.length) return;

    const targetEnemy = currentEnemies[targetIndex];
    if (!targetEnemy || targetEnemy.defeated) return;

    if (!currentQuestion) {
      setCurrentQuestion(targetEnemy.getNextQuestion());
    }

    const trimmedInput = input.trim();

    // 問題の正解から<>タグを除去
    const cleanedAnswer = currentQuestion.answer.replace(/<|>/g, "");

    if (trimmedInput.toLowerCase() === cleanedAnswer.toLowerCase()) {
      // 正解の場合
      const newCombo = comboCount + 1;
      playerAttack.handleComboUpdate(newCombo);
      // アクティブなスキルがあれば実行
      if (activeSkill && activeSkill.activationTiming === "onCorrectAnswer") {
        // スキルを実行
        console.log("active", activeSkill);
        activeSkill.activationTiming = "onCommand";
        handleSkillUse(activeSkill, targetIndex);
        // const result = activeSkill.execute(player, currentEnemies, targetIndex);

        // if (result.success) {
        //   // MP消費処理
        //   setPlayer((prev) => {
        //     return new PlayerModel(
        //       prev.hp,
        //       prev.maxHP,
        //       prev.mp - activeSkill.mpCost,
        //       prev.maxMP,
        //       prev.defense,
        //       prev.magicDefense,
        //       prev.level,
        //       prev.exp,
        //       prev.totalExp,
        //       prev.speed,
        //       prev.attack,
        //       prev.luck,
        //       prev.power,
        //       prev.statusEffects
        //     );
        //   });

        //   // スキルダメージ表示
        //   if (result.targetIndex !== undefined) {
        //     combat.setDamageDisplay(
        //       result.targetIndex,
        //       result.damageAmount || 0
        //     );
        //     combat.setHitFlag(result.targetIndex, ENEMY_HIT_ANIMATION_DURATION);
        //   }
        //   console.log(result.message);
        //   // スキルメッセージ表示
        //   setMessage({
        //     text: result.message,
        //     sender: "player",
        //   });
        // }

        // アクティブスキルをリセット
        setActiveSkill(null);
      } else {
        // 通常攻撃処理
        const { damage, specialMessage } =
          playerAttack.calculateEffectiveDamage(
            currentQuestion,
            targetEnemy,
            newCombo,
            wrongAttempts
          );
        targetEnemy.takeDamage(damage);

        // ダメージ表示とヒットアニメーション
        combat.setDamageDisplay(targetIndex, damage);
        combat.setHitFlag(targetIndex, ENEMY_HIT_ANIMATION_DURATION);

        // ダメージメッセージを設定
        playerAttack.setAttackResultMessage(damage, specialMessage);
      }

      setWrongAttempts(0);

      // 敵が倒されたかチェック
      if (targetEnemy.defeated) {
        playerAttack.setEnemyDefeatedMessage(targetEnemy.name);

        // 次のターゲットを探す
        const nextIndex = StageManager.findNextAliveEnemyIndex(
          targetIndex,
          currentEnemies
        );
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
      playerAttack.setWrongAnswerMessage();

      // アクティブスキルも解除
      setActiveSkill(null);
    }
  };

  // すべての敵が倒されたかチェック
  const checkStageCompletion = () => {
    const allDefeated = StageManager.isStageCompleted(currentEnemies);
    if (allDefeated) {
      const totalEXP = StageManager.calculateTotalExp(currentEnemies);

      setTimeout(() => {
        gainEXP(totalEXP);
        //setMessage(StageManager.createCompletionMessage(totalEXP));
        setReadyForNextStage(true);
      }, 2000);
    }
  };

  // プレイヤーに経験値を付与
  const gainEXP = (amount: number) => {
    // ExperienceManager から setShowLevelUp も渡すように変更
    const lvu = ExperienceManager.gainExperience(
      amount,
      player,
      setPlayer,
      setExpGain
    );

    // ステージ完了メッセージを設定
    setMessage(StageManager.createCompletionMessage(amount));
    setShowLevelUp(lvu);
  };
  // 新しい戦闘ステージを生成
  const spawnNewStage = () => {
    const { enemies, message } = StageManager.createNewStage();
    setCurrentEnemies(enemies);
    setTargetIndex(0);
    setMessage(message);
  };

  // ターゲット選択の処理
  const handleSelectTarget = (index: number) => {
    setTargetIndex(index);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // スキル使用時の処理関数（App コンポーネント内に追加）
  const handleSkillUse = (skill: SkillInstance, targetIndex?: number) => {
    // スキルがコマンド型（即時発動）の場合
    if (skill.activationTiming === "onCommand") {
      // 単体敵対象スキルの場合は targetIndex を確認
      if (skill.targetType === "singleEnemy" && targetIndex === undefined) {
        setMessage({
          text: "対象の敵を選択してください。",
          sender: "system",
        });
        return;
      }

      // スキルが使用可能かチェック
      if (!skill.canUse(player)) {
        setMessage({
          text: "MPが足りないか、クールダウン中です。",
          sender: "system",
        });
        return;
      }
      console.log("skilltype", skill.type);
      // スキルタイプに応じた処理
      if (skill.type === "heal") {
        // 回復スキルの場合
        const result = skill.execute(player, currentEnemies, targetIndex);

        if (result.success) {
          // プレイヤー状態の更新（MP消費と回復）
          setPlayer((prev) => {
            const newHP = Math.min(
              prev.hp + (result.healAmount || 0),
              prev.maxHP
            );
            return new PlayerModel(
              newHP,
              prev.maxHP,
              prev.mp - skill.mpCost,
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
              prev.statusEffects
            );
          });

          // 回復エフェクトを表示 - プレイヤー位置に表示
          showSkillEffectAnimation(
            "heal",
            { x: window.innerWidth / 2, y: window.innerHeight / 2 - 50 },
            result.healAmount,
            skill.name
          );
          // メッセージ表示
          setMessage({
            text: result.message,
            sender: "player",
          });
        } else {
          setMessage({
            text: result.message,
            sender: "system",
          });
        }
      } else if (skill.type === "damage") {
        // ダメージスキルの場合
        const result = skill.execute(player, currentEnemies, targetIndex);
        if (skill.id === "fire_bolt") {
          if (result.success) {
            // MP消費処理
            setPlayer((prev) => {
              return new PlayerModel(
                prev.hp,
                prev.maxHP,
                prev.mp - skill.mpCost,
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
                prev.statusEffects
              );
            });

            // ダメージ表示アニメーション
            if (result.targetIndex !== undefined) {
              combat.setDamageDisplay(
                result.targetIndex,
                result.damageAmount || 0
              );
              combat.setHitFlag(
                result.targetIndex,
                ENEMY_HIT_ANIMATION_DURATION
              );

              // 対象の敵の位置にファイアボルトエフェクトを表示
              const targetEnemy = currentEnemies[result.targetIndex];
              const enemyPosition = targetEnemy.positionOffset || {
                x: 0,
                y: 0,
              };

              // 画面中央を基準に、敵の位置にエフェクトを表示
              const centerX = window.innerWidth / 2;
              const centerY = window.innerHeight / 2;

              showFireSkillEffect(
                "ファイアボルト",
                {
                  x: centerX + enemyPosition.x,
                  y: centerY - 100 + enemyPosition.y,
                },
                result.damageAmount,
                "low" // 低威力設定
              );
            }

            // メッセージ表示
            setMessage({
              text: result.message,
              sender: "player",
            });

            // 敵が倒されたかチェック
            checkStageCompletion();
          }
        }
      }

      // アクティブスキルをリセット
      setActiveSkill(null);
    } else {
      // コマンド型でないスキル（例：問題回答と組み合わせるスキル）の場合
      setActiveSkill(skill);
    }
  };

  // 死亡後のゲーム継続処理
  const handleContinueGame = () => {
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
  };

  // 次のステージへ進むハンドラ
  const handleNextStage = () => {
    spawnNewStage();
    setReadyForNextStage(false);
  };

  // プレイヤーが死亡したらゲームオーバー画面を表示(戦闘不能になってから5秒後)
  useEffect(() => {
    if (player.hp <= 0) {
      setIsDead(true);
      setTimeout(() => {
        setShowGameOver(true);
        setIsDead(false);
      }, 5000);
    }
  }, [player.hp]);

  return (
    <CombatEffects
      isScreenHit={combat.isScreenHit}
      isScreenShake={combat.isScreenShake}
    >
      {isDead && (
        <div className="absolute inset-0 bg-black opacity-70 z-100 flex items-center justify-center">
          <span className="text-white font-bold text-xl">戦闘不能…</span>
        </div>
      )}

      {showGameOver && (
        <GameOver totalEXP={player.totalExp} onContinue={handleContinueGame} />
      )}
      {/* ファイヤースキル発動 */}
      {fireSkillEffect && (
        <div className="z-500 opacity-80">
          <FireSkillEffect
            skillName={fireSkillEffect.skillName}
            targetPosition={fireSkillEffect.targetPosition}
            damageValue={fireSkillEffect.damageValue}
            power={fireSkillEffect.power}
            onComplete={() => setFireSkillEffect(null)}
            duration={1500}
          />
        </div>
      )}
      {!showGameOver && (
        <div className="bg-black">
          {/* スキル管理画面 */}
          {showSkillManagement && (
            <SkillManagement
              equippedSkills={equippedSkills}
              onEquipSkill={handleEquipSkill}
              onUnequipSkill={handleUnequipSkill}
              playerLevel={player.level}
              onClose={() => setShowSkillManagement(false)}
              availableSkillIds={availableSkillIds}
            />
          )}

          {/* スキルエフェクト表示 */}
          {skillEffect && (
            <SkillEffect
              type={skillEffect.type}
              targetPosition={skillEffect.targetPosition}
              value={skillEffect.value}
              skillName={skillEffect.skillName}
              onComplete={() => setSkillEffect(null)}
              duration={1000}
            />
          )}
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
              onSkillUse={handleSkillUse}
              expGain={expGain}
              inputRef={inputRef}
              isKeyboardVisible={isKeyboardVisible}
              currentEnemies={currentEnemies}
              targetIndex={targetIndex}
              equippedSkills={equippedSkills}
              setEquippedSkills={setEquippedSkills}
              onOpenSkillManagement={() => setShowSkillManagement(true)}
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
              onEnemyAttack={combat.handleEnemyAttack}
              message={message}
              currentQuestion={currentQuestion}
              wrongAttempts={wrongAttempts}
              enemyHitFlags={combat.enemyHitFlags}
              enemyAttackFlags={combat.enemyAttackFlags}
              enemyFireFlags={combat.enemyFireFlags}
              damageNumbers={combat.damageNumbers}
              onFullRevealChange={setIsHintFullyRevealed}
              onSelectTarget={handleSelectTarget}
              comboCount={comboCount}
              isKeyboardVisible={isKeyboardVisible}
              inputRef={inputRef}
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
              <NextStageButton
                onNext={handleNextStage}
                isKeyboardVisible={isKeyboardVisible}
              />
            )}
          </div>
        </div>
      )}
    </CombatEffects>
  );
};

export default App;
