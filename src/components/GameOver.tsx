// src/components/GameOver.tsx
import React from "react";

interface GameOverProps {
  totalEXP: number;
}

const GameOver: React.FC<GameOverProps> = ({ totalEXP }) => {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-black text-white">
      <h1 className="text-4xl font-bold mb-4">ゲームオーバー</h1>
      <p className="mb-6">獲得経験値: {totalEXP}</p>
      <button
        onClick={() => window.location.reload()}
        className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700"
      >
        再挑戦する
      </button>
    </div>
  );
};

export default GameOver;
