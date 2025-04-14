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
    <div className="absolute bottom-25 left-1/2 bg-gray-800/50 rounded-md p-3 transform -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="mb-4 text-white text-center text-lg">
        {isBossFloor 
          ? "ボスを倒しました！" 
          : "全ての敵を倒しました！"}
      </div>
      
      {!canAdvance && advanceStatus.requiredCount > 0 && (
        <div className="mb-3 text-yellow-300 p-3 text-center">
          <span>あと{advanceStatus.remainingCount}回鍛錬すると次に進めます</span>
          <div className="w-full bg-gray-700 h-2 rounded-full mt-1">
            <div 
              className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
              style={{width: `${(advanceStatus.currentCount / advanceStatus.requiredCount) * 100}%`}}
            ></div>
          </div>
          <div className="text-xs text-white mt-1">
            クリア状況: {advanceStatus.currentCount}/{advanceStatus.requiredCount}
          </div>
        </div>
      )}
      
      <div className="flex space-x-4">
        <button
          onClick={onStay}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
        >
          腕を磨く
        </button>
        
        {canAdvance && (
          <button
            onClick={onNext}
            className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
          >
            先に進む
          </button>
        )}
      </div>
      
      <div className="mt-2 text-white text-sm text-center">
        {canAdvance 
          ? "この周囲に留まれば、練習を続けられます。次のフロアに進むと、難しい敵と戦えます。"
          : `あと${advanceStatus.remainingCount}回戦闘して進行度を上げましょう。`
        }
      </div>
    </div>
  );
};

export default NextStageButton;