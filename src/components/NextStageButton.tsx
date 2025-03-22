// src/components/NextStageButton.tsx - シンプル化版
import React from 'react';

interface NextStageButtonProps {
  onNext: () => void;
}

/**
 * 次のステージに進むためのボタンコンポーネント
 */
const NextStageButton: React.FC<NextStageButtonProps> = ({ onNext }) => {
  return (
    <div className="absolute bottom-50 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={onNext}
        className="px-2 py-1 text-sm bg-red-600 text-white rounded shadow hover:bg-blue-700 transition-colors"
      >
        次の敵に進む
      </button>
    </div>
  );
};

export default NextStageButton;