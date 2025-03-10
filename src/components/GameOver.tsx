// src/components/GameOver.tsx
import React from "react";

interface GameOverProps {
  totalEXP: number;
  onContinue?: () => void;
  onRestart?: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ 
  totalEXP, 
  onContinue,
  onRestart = () => window.location.reload() 
}) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">ゲームオーバー</h1>
      <p className="mb-6">獲得経験値: {totalEXP}</p>
      
      <div className="flex flex-col space-y-4">
        {/* Continue button */}
        {onContinue && (
          <button
            onClick={onContinue}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            コンティニュー
          </button>
        )}
        
        {/* Restart button */}
        <button
          onClick={onRestart}
          className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          はじめから
        </button>
      </div>
    </div>
  );
};

export default GameOver;