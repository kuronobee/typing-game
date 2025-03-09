// src/components/PlayerInfo.tsx
import React from 'react';
import PlayerStatus from './PlayerStatus';
import ExperienceBar from './ExperienceBar';

interface PlayerInfoProps {
    playerHP: number;
    maxHP: number;
    playerMP: number;
    maxMP: number;
    isPoisoned?: boolean;
    playerLevel: number;
    playerEXP: number;
    expToNextLevel: number;
    expGain?: number | null;
    isCompact?: boolean; // コンパクト表示モード
}

const PlayerInfo: React.FC<PlayerInfoProps> = ({
    playerHP,
    maxHP,
    playerMP,
    maxMP,
    isPoisoned = false,
    playerLevel,
    playerEXP,
    expToNextLevel,
    expGain,
    isCompact = false, // デフォルト値はfalse
}) => {
    // キーボード表示時のコンパクトモード
    if (isCompact) {
        return (
            <div className="flex flex-row bg-gray-800">
            <ExperienceBar
                playerLevel={playerLevel}
                playerEXP={playerEXP}
                expToNextLevel={expToNextLevel}
                expGain={expGain}
            />
            <PlayerStatus
                playerHP={playerHP}
                maxHP={maxHP}
                playerMP={playerMP}
                maxMP={maxMP}
                isPoisoned={isPoisoned}
            />
        </div>
        );
    }

    // 通常表示モード
    return (
        <div className="flex flex-row bg-gray-800">
            <ExperienceBar
                playerLevel={playerLevel}
                playerEXP={playerEXP}
                expToNextLevel={expToNextLevel}
                expGain={expGain}
            />
            <PlayerStatus
                playerHP={playerHP}
                maxHP={maxHP}
                playerMP={playerMP}
                maxMP={maxMP}
                isPoisoned={isPoisoned}
            />
        </div>
    );
};

export default PlayerInfo;