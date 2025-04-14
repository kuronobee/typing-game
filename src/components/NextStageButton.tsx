// src/components/NextStageButton.tsx - 選択肢付き版
import React from 'react';

interface NextStageButtonProps {
  onNext: () => void;
  onStay: () => void;
  isBossFloor?: boolean;
}

/**
 * 次のステージに進むためのボタンコンポーネント（選択肢付き）
 */
const NextStageButton: React.FC<NextStageButtonProps> = ({ 
  onNext, 
  onStay,
  isBossFloor = false
}) => {
  return (
    <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
      <div className="mb-4 text-white text-center text-lg">
        {isBossFloor 
          ? "ボスを倒しました！" 
          : "全ての敵を倒しました！"}
      </div>
      <div className="flex space-x-4">
        <button
          onClick={onStay}
          className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
        >
          このフロアに留まる
        </button>
        <button
          onClick={onNext}
          className="px-4 py-2 bg-red-600 text-white rounded shadow hover:bg-red-700 transition-colors"
        >
          次のフロアに進む
        </button>
      </div>
      <div className="mt-2 text-gray-400 text-sm text-center">
        同じフロアに留まれば、練習を続けられます。<br/>
        次のフロアに進むと、難しい敵と戦えます。
      </div>
    </div>
  );
};

export default NextStageButton;