// src/components/NextStageButton.tsx
import React from 'react';

interface NextStageButtonProps {
  onNext: () => void;
  isKeyboardVisible: boolean;
}

/**
 * 次のステージに進むためのボタンコンポーネント
 */
const NextStageButton: React.FC<NextStageButtonProps> = ({ 
  onNext, 
  isKeyboardVisible 
}) => {
  return (
    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 z-50">
      <button
        onClick={onNext}
        className={`${
          isKeyboardVisible
            ? "px-2 py-1 text-sm" // キーボード表示時は小さく
            : "px-4 py-2" // 通常時は大きく
        } bg-red-600 text-white rounded shadow hover:bg-blue-700 transition-colors`}
      >
        次の敵に進む
      </button>
    </div>
  );
};

export default NextStageButton;