import React from 'react';
import { StageProgressionManager } from '../data/stages';

interface NextStageButtonProps {
  onNext: () => void;
  onStay: () => void;
  isBossFloor?: boolean;
  stageId?: string;
  floorIndex?: number;
}

const NextStageButton: React.FC<NextStageButtonProps> = ({ 
  onNext, 
  onStay,
  isBossFloor = false,
  stageId,
  floorIndex
}) => {
  // 現在の進行状況を取得
  const currentProgress = StageProgressionManager.getCurrentProgress();
  const currentStageId = stageId || currentProgress.stageId;
  const currentFloorIndex = floorIndex !== undefined ? floorIndex : currentProgress.floorIndex;
  
  // 次のフロアに進める条件を確認
  const advanceStatus = StageProgressionManager.getFloorAdvanceStatus(currentStageId, currentFloorIndex);
  const canAdvance = advanceStatus.canAdvance;

  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="mb-4 text-white text-center text-lg">
        {isBossFloor 
          ? "ボスを倒しました！" 
          : "全ての敵を倒しました！"}
      </div>
      
      {!canAdvance && advanceStatus.requiredCount > 0 && (
        <div className="mb-3 text-yellow-300 text-center">
          <span>このフロアをあと{advanceStatus.remainingCount}回クリアすると次に進めます</span>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{width: `${(advanceStatus.currentCount / advanceStatus.requiredCount) * 100}%`}}
            ></div>
          </div>
          <div className="text-xs text-gray-300 mt-1">
            クリア状況: {advanceStatus.currentCount}/{advanceStatus.requiredCount}
          </div>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={onStay}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
        >
          このフロアに留まる
        </button>
        
        {canAdvance && (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
          >
            次のフロアに進む
          </button>
        )}
      </div>
      
      <div className="mt-2 text-gray-400 text-sm text-center">
        {canAdvance 
          ? "同じフロアに留まれば、練習を続けられます。次のフロアに進むと、難しい敵と戦えます。"
          : `このフロアをあと${advanceStatus.remainingCount}回クリアして進行度を上げましょう。`
        }
      </div>
    </div>
  );
};

export default NextStageButton;