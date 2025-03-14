// src/components/QuestionContainer.tsx - with hint button
import React, { useState, useEffect } from "react";
import { Question } from "../data/questions";

interface QuestionContainerProps {
  question: Question | null;
  wrongAttempts: number;
  attackProgress: number; // 0～1 の値（例: 0.5なら50%進捗）
  onFullRevealChange: (fullReveal: boolean) => void;
  isCompact?: boolean; // コンパクト表示モード
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({ 
    question, 
    wrongAttempts, 
    attackProgress, 
    onFullRevealChange,
    isCompact = false,
}) => {
  // fullReveal が true の場合、ヒントは完全に開かれる
  const [fullReveal, setFullReveal] = useState(false);

  // 問題文が変更されたら fullReveal を false にする
  useEffect(() => {
    setFullReveal(false);
  }, [question]);
  
  // fullRevealの変化を上位コンポーネントへ通知
  useEffect(() => {
    if (onFullRevealChange) {
      onFullRevealChange(fullReveal);
    }
  }, [fullReveal, onFullRevealChange]);
    
  // Escキーで fullReveal を true にするイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setFullReveal(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // ヒント全開示ボタンのクリックハンドラー
  const handleRevealHint = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFullReveal(true);
  };

  // ヒント生成関数
  const getHint = (answer: string, wrongAttempts: number): string => {
    // fullReveal が true なら答えをそのまま返す
    if (fullReveal) {
      return answer;
    }
    // 部分的にヒントを開く処理
    const n = answer.length;
    const hintArray: string[] = answer.split("").map(ch => (ch === " " ? " " : "_"));
    const nonSpaceIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (answer[i] !== " ") {
        nonSpaceIndices.push(i);
      }
    }
    const orderList: number[] = [];
    if (nonSpaceIndices.length > 1) {
      orderList.push(nonSpaceIndices[1]);
    }
    if (nonSpaceIndices.length > 3) {
      orderList.push(nonSpaceIndices[3]);
    }
    for (const idx of nonSpaceIndices) {
      if (!orderList.includes(idx)) {
        orderList.push(idx);
      }
    }
    const reveals = Math.min(wrongAttempts, orderList.length);
    for (let i = 0; i < reveals; i++) {
      const idx = orderList[i];
      hintArray[idx] = answer[idx];
    }
    return hintArray.join("\u2009");
  };

  // コンパクトモード用のスタイルとレイアウト
  const containerClasses = `
    relative 
    question-container
    bg-black/50 
    border-white 
    ${isCompact ? 'border-[1px] py-1 px-2' : 'border-2 px-4 py-2'} 
    text-white
    rounded
    transition-all 
    duration-300
  `;
  
  // ヒントボタンのスタイル
  const hintButtonClass = `
    ${isCompact ? 'w-5 h-5 text-xs mr-1' : 'w-6 h-6 text-sm mr-2'}
    bg-blue-500 
    rounded-full 
    flex 
    items-center 
    justify-center 
    hover:bg-blue-600 
    cursor-pointer
  `;
  
  // 極限まで省スペース化したコンパクトデザイン
  if (isCompact) {
    return (
      <div className={containerClasses}>
        {/* 攻撃ゲージを小さく上部に表示 */}
        <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-30 w-100 h-[4px]">
          <div className="w-full h-full bg-gray-300 rounded-sm">
            <div
              className="h-full bg-red-500 rounded-sm"
              style={{ width: `${Math.min(attackProgress * 100, 100)}%` }}
            ></div>
          </div>
        </div>
        
        {/* 内容を一行に集約 */}
        <div className="flex flex-col pt-1">
          <div className="flex-1 p-1 pl-5 text-sm">{question?.prompt}</div>
          <div className="flex-1 pl-5 text-sm flex items-center">
            <span 
              className={hintButtonClass}
              onClick={handleRevealHint}
            >
              ?
            </span>
            {getHint(question?.answer ?? "", wrongAttempts)}
          </div>
        </div>
      </div>
    );
  }

  // 通常モード
  return (
    <div className={containerClasses}>
      {/* 攻撃インジケータ */}
      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 w-64">
        <div className="w-full h-2 bg-gray-300 rounded">
          <div
            className="h-full bg-red-500 rounded"
            style={{ width: `${Math.min(attackProgress * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* ゲージと重ならないようにコンテンツにパディング */}
      <div className="pt-4">
        <p className="font-bold">問題: {question?.prompt}</p>
        <div className="mt-2 flex items-center">
          <div 
            className={hintButtonClass}
            onClick={handleRevealHint}
          >
            ?
          </div>
          <span>ヒント: {getHint(question?.answer ?? "", wrongAttempts)}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionContainer;