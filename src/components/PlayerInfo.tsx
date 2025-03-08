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
            <div className="flex flex-row bg-gray-800 py-1">
                {/* コンパクトなHPとMP表示 */}
                <div className="flex-1 px-1 text-xs">
                    <div className="flex items-center">
                        <span className="font-bold w-5">HP</span>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className={`h-full ${isPoisoned ? "bg-purple-500" : "bg-green-500"}`}
                                style={{ width: `${(playerHP / maxHP) * 100}%` }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center -mt-1">
                        <span className="font-bold w-5">MP</span>
                        <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-blue-500"
                                style={{ width: `${(playerMP / maxMP) * 100}%` }}
                            />
                        </div>
                    </div>
                </div>
                
                {/* コンパクトな経験値表示 */}
                <div className="flex-1 px-1 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="font-bold">Lv.{playerLevel}</span>
                        <span className="text-xs">{playerEXP}/{expToNextLevel}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-700 rounded-full mt-1">
                        <div 
                            className="h-full bg-yellow-500"
                            style={{ width: `${(playerEXP / expToNextLevel) * 100}%` }}
                        />
                    </div>
                </div>
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