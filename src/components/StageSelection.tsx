// src/components/StageSelection.tsx - 階層システム対応版
import React, { useState } from 'react';
import '../styles/stageSelection.css';
import { stages, StageProgressionManager, Stage, Floor } from '../data/stages';

interface StageSelectionProps {
  onStageSelect: (stageId: string, floorIndex: number) => void;
}

const StageSelection: React.FC<StageSelectionProps> = ({ onStageSelect }) => {
  // 選択中のステージを保持
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  
  // 継続プレイの場合、現在の進行状況を取得
  const currentProgress = StageProgressionManager.getCurrentProgress();
  const currentStage = stages.find(s => s.id === currentProgress.stageId);
  const currentFloor = currentStage?.floors[currentProgress.floorIndex];
  
  // ステージ選択画面の表示
  const renderStageSelection = () => (
    <div className="stage-selection-container">
      <h1 className="stage-selection-title pulse-animation">英単語バトル - ステージ選択</h1>
      
      {/* 継続プレイオプション */}
      {currentStage && currentFloor && (
        <div className="continue-panel mb-8 bg-gray-800 p-4 rounded-lg border-2 border-yellow-600">
          <h2 className="text-xl text-yellow-400 mb-2">継続プレイ</h2>
          <p className="text-white mb-2">
            前回のプレイ: <span className="font-bold">{currentStage.name}</span> - 
            <span className="font-bold">{currentFloor.name}</span> 
            ({currentProgress.floorIndex + 1}/{currentStage.floors.length})
          </p>
          <button 
            className="bg-yellow-600 hover:bg-yellow-500 text-white py-2 px-4 rounded"
            onClick={() => onStageSelect(currentProgress.stageId, currentProgress.floorIndex)}
          >
            続きからプレイ
          </button>
        </div>
      )}
      
      <div className="stage-selection-grid">
        {stages.filter(stage => stage.unlocked).map(stage => (
          <div 
            key={stage.id}
            className={`stage-card bg-gray-800 rounded-lg overflow-hidden ${selectedStage?.id === stage.id ? 'border-yellow-400' : ''}`}
            onClick={() => setSelectedStage(stage)}
          >
            <div className={`stage-card-image ${stage.backgroundClass}`}>
              <div className="stage-card-overlay"></div>
              <div className="absolute bottom-3 left-3">
                <div className="stage-title">{stage.name}</div>
                <div className="stage-difficulty">{stage.difficulty}</div>
              </div>
            </div>
            <div className="p-4">
              <p className="stage-description">{stage.description}</p>
              <div className="mt-2 text-xs text-gray-400">
                全{stage.floors.length}フロア
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* ステージが選択された場合、そのフロアを表示 */}
      {selectedStage && (
        <div className="mt-8 w-full max-w-4xl">
          <h2 className="text-xl text-yellow-400 mb-4">{selectedStage.name} - フロア選択</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {selectedStage.floors.map((floor, index) => (
              <div 
                key={floor.id}
                className={`p-3 bg-gray-800 rounded border ${floor.isBossFloor ? 'border-red-600' : 'border-gray-700'} 
                  hover:border-yellow-500 cursor-pointer transition-all`}
                onClick={() => onStageSelect(selectedStage.id, index)}
              >
                <div className="text-white font-bold">
                  {floor.name}
                  {floor.isBossFloor && <span className="ml-2 text-red-500">🔥</span>}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {floor.isBossFloor ? 'ボスフロア' : `フロア ${index + 1}`}
                </div>
                <div className="text-xs text-gray-300 mt-2 line-clamp-2">
                  {floor.description}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="stage-selection-footer">
        <p className="mb-2">ヒント: ステージを選択するとフロアが表示されます。各フロアを順番にクリアして進みましょう。</p>
        <p>ボスフロアは特に強力な敵が待ち構えていますが、経験値ボーナスがあります！</p>
      </div>
    </div>
  );
  
  return renderStageSelection();
};

export default StageSelection;