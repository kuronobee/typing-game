// src/contexts/GameContext.tsx
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Question } from '../data/questions';
import { Player as PlayerModel } from '../models/Player';
import { Enemy as EnemyModel } from '../models/EnemyModel';
import { MessageType } from '../components/MessageDisplay';
import { StageManager } from '../managers/StageManager';
import { ExperienceManager } from '../managers/ExperienceManager';
import { useSkillManagement } from '../hooks/useSkillManagement';

// GameContext の型定義
interface GameContextType {
    // プレイヤー状態
    player: PlayerModel;
    setPlayer: React.Dispatch<React.SetStateAction<PlayerModel>>;
    isDead: boolean;
    setIsDead: React.Dispatch<React.SetStateAction<boolean>>;
    showGameOver: boolean;
    setShowGameOver: React.Dispatch<React.SetStateAction<boolean>>;

    // 敵とステージ
    currentEnemies: EnemyModel[];
    setCurrentEnemies: React.Dispatch<React.SetStateAction<EnemyModel[]>>;
    targetIndex: number;
    setTargetIndex: React.Dispatch<React.SetStateAction<number>>;
    readyForNextStage: boolean;
    setReadyForNextStage: React.Dispatch<React.SetStateAction<boolean>>;

    // 経験値とレベルアップ
    expGain: number | null;
    setExpGain: React.Dispatch<React.SetStateAction<number | null>>;
    levelUpQueue: number[];
    setLevelUpQueue: React.Dispatch<React.SetStateAction<number[]>>;
    currentShowingLevel: number | null;
    setCurrentShowingLevel: React.Dispatch<React.SetStateAction<number | null>>;
    levelCompletionCallbacksRef: React.MutableRefObject<(() => void)[]>; // レベルアップ完了時のコールバックを保持するref

    // 問題と進行状況
    currentQuestion: Question | null;
    setCurrentQuestion: React.Dispatch<React.SetStateAction<Question | null>>;
    wrongAttempts: number;
    setWrongAttempts: React.Dispatch<React.SetStateAction<number>>;
    comboCount: number;
    setComboCount: React.Dispatch<React.SetStateAction<number>>;
    isHintFullyRevealed: boolean;
    setIsHintFullyRevealed: React.Dispatch<React.SetStateAction<boolean>>;

    // メッセージ
    message: MessageType | null;
    setMessage: React.Dispatch<React.SetStateAction<MessageType | null>>;

    // メソッド
    spawnNewStage: () => void;
    checkStageCompletion: (enemies?: EnemyModel[]) => boolean;
    handleSelectTarget: (index: number) => void;
    handleContinueGame: () => void;
    gainEXP: (amount: number) => boolean;
}

// GameContext の作成
const GameContext = createContext<GameContextType | null>(null);
// プロバイダーコンポーネント
interface GameProviderProps {
    children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
    // プレイヤー状態
    const [player, setPlayer] = useState<PlayerModel>(PlayerModel.createDefault());
    const [isDead, setIsDead] = useState(false);
    const [showGameOver, setShowGameOver] = useState(false);

    // 敵とステージ
    const [currentEnemies, setCurrentEnemies] = useState<EnemyModel[]>([]);
    const [targetIndex, setTargetIndex] = useState(0);
    const [readyForNextStage, setReadyForNextStage] = useState(false);

    // 経験値とレベルアップ
    const [expGain, setExpGain] = useState<number | null>(null);
    const [levelUpQueue, setLevelUpQueue] = useState<number[]>([]);
    const [currentShowingLevel, setCurrentShowingLevel] = useState<number | null>(null);

    // 問題と進行状況
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [wrongAttempts, setWrongAttempts] = useState(0);
    const [comboCount, setComboCount] = useState(0);
    const [isHintFullyRevealed, setIsHintFullyRevealed] = useState(false);

    // メッセージ
    const [message, setMessage] = useState<MessageType | null>(null);

    // レベルアップ完了時のコールバックを保持するref
    const levelCompletionCallbacksRef = React.useRef<(() => void)[]>([]);
    const skillManagement = useSkillManagement(setMessage);

    // ステージの生成
    const spawnNewStage = useCallback(() => {
        const { enemies, message: newMessage } = StageManager.createNewStage();
        setCurrentEnemies(enemies);
        setTargetIndex(0);
        setMessage(newMessage);
    }, []);

    // ターゲット選択
    const handleSelectTarget = useCallback((index: number) => {
        setTargetIndex(index);
    }, []);

    // ステージクリア判定
    const checkStageCompletion = useCallback((enemies = currentEnemies) => {
        return StageManager.handleStageCompletion(
            enemies,
            gainEXP,
            setMessage,
            setReadyForNextStage
        );
    }, [currentEnemies]);

    // 経験値獲得処理 - レベル上昇を1つずつ表示するロジックを復元
    const gainEXP = useCallback((amount: number): boolean => {
        if (amount <= 0 || amount > 10000) {
            console.error(`無効な経験値量: ${amount}`);
            return false;
        }

        console.log(`経験値を獲得: ${amount}`);

        try {
            // レベルアップ表示のコールバック関数
            const showLevelUpCallback = (level: number, callback: () => void) => {
                console.log(`レベル ${level} の表示処理を開始`);

                if (level <= 0 || level > 100) {
                    console.error(`無効なレベル値: ${level}`);
                    callback(); // エラー時は次の処理へ
                    return;
                }

                // レベルアップキューに追加
                setLevelUpQueue(prev => [...prev, level]);

                // 表示用の状態変数を更新
                window.setTimeout(() => {
                    console.log(`レベル ${level} の通知を表示`);
                    setCurrentShowingLevel(level);
                    // このレベルのコールバック関数をキューに追加
                    levelCompletionCallbacksRef.current.push(callback);
                }, 100);
            };

            // 前のレベルを記録
            const oldLevel = player.level;

            // ExperienceManager に改良した関数を渡す
            const didLevelUp = ExperienceManager.gainExperience(
                amount,
                player,
                setPlayer,
                setExpGain,
                skillManagement?.acquireNewSkill, // スキル獲得関数を追加
                showLevelUpCallback
            );

            // レベルの整合性チェック
            if (player.level < oldLevel) {
                console.error(`レベルダウン検出: ${oldLevel} → ${player.level}、修正します`);
                // 以前のレベルに戻す緊急修正
                setPlayer(prev => new PlayerModel(
                    prev.hp,
                    prev.maxHP,
                    prev.mp,
                    prev.maxMP,
                    prev.defense,
                    prev.magicDefense,
                    oldLevel, // 元のレベルを維持
                    prev.exp,
                    prev.totalExp,
                    prev.speed,
                    prev.attack,
                    prev.luck,
                    prev.power,
                    prev.statusEffects
                ));
            }

            // ステージ完了メッセージを設定
            setMessage(StageManager.createCompletionMessage(amount));

            return didLevelUp;
        } catch (error) {
            console.error('経験値獲得処理中にエラーが発生しました:', error);
            setMessage({
                text: "経験値獲得処理中にエラーが発生しました",
                sender: "system"
            });
            return false;
        }
    }, [player, setPlayer, setExpGain, setLevelUpQueue, setCurrentShowingLevel, setMessage]);

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
    }, [currentEnemies, spawnNewStage]);

    // コンテキスト値の作成
    const contextValue: GameContextType = {
        // プレイヤー状態
        player,
        setPlayer,
        isDead,
        setIsDead,
        showGameOver,
        setShowGameOver,

        // 敵とステージ
        currentEnemies,
        setCurrentEnemies,
        targetIndex,
        setTargetIndex,
        readyForNextStage,
        setReadyForNextStage,

        // 経験値とレベルアップ
        expGain,
        setExpGain,
        levelUpQueue,
        setLevelUpQueue,
        currentShowingLevel,
        setCurrentShowingLevel,
        levelCompletionCallbacksRef, // レベルアップ完了時のコールバックを保持するref

        // 問題と進行状況
        currentQuestion,
        setCurrentQuestion,
        wrongAttempts,
        setWrongAttempts,
        comboCount,
        setComboCount,
        isHintFullyRevealed,
        setIsHintFullyRevealed,

        // メッセージ
        message,
        setMessage,

        // メソッド
        spawnNewStage,
        checkStageCompletion,
        handleSelectTarget,
        handleContinueGame,
        gainEXP
    };

    return (
        <GameContext.Provider value={contextValue}>
            {children}
        </GameContext.Provider>
    );
};

// カスタムフック
export const useGame = (): GameContextType => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error('useGame must be used within a GameProvider');
    }
    return context;
};