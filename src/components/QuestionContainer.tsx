// src/components/QuestionContainer.tsx
import React, { useState, useEffect } from "react";
import { Question } from "../data/questions";

interface QuestionContainerProps {
  question: Question | null;
  wrongAttempts: number;
  attackProgress: number; // 0～1 の値（例: 0.5なら50%進捗）
  round: number; // 新しい問題に切り替わったかどうかを判定するためのラウンド数
  onFullRevealChange: (fullReveal: boolean) => void;
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({ 
    question, 
    wrongAttempts, 
    attackProgress, 
    round,
    onFullRevealChange, }) => {
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

  // ヒント生成関数
  const getHint = (answer: string, wrongAttempts: number): string => {
    // fullReveal が true なら答えをそのまま返す
    if (fullReveal) {
      return answer;
    }
    // 部分的にヒントを開く処理
    const n = answer.length;
    const hintArray = answer.split("").map(ch => (ch === " " ? " " : "_"));
    let nonSpaceIndices: number[] = [];
    for (let i = 0; i < n; i++) {
      if (answer[i] !== " ") {
        nonSpaceIndices.push(i);
      }
    }
    let orderList: number[] = [];
    if (nonSpaceIndices.length > 1) {
      orderList.push(nonSpaceIndices[1]);
    }
    if (nonSpaceIndices.length > 3) {
      orderList.push(nonSpaceIndices[3]);
    }
    for (let idx of nonSpaceIndices) {
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

    return (
        <div className="relative bg-black/50 border-white border-2 text-white px-4 py-2 rounded">
            {/* 攻撃インジケータ */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30 w-64">
                <div className="w-full h-2 bg-gray-300 rounded">
                    <div
                    className="h-full bg-red-500 rounded"
                        style={{ width: `${Math.min(attackProgress * 100, 100)}%` }}
                    ></div>
                </div>
            </div>
            {/* ゲージと重ならないように上部にパディング */}
            <div className="pt-4">
                <p className="font-bold">問題: {question.prompt}</p>
                <p className="mt-2">ヒント: {getHint(question.answer, wrongAttempts)}</p>
            </div>
        </div>
    );
};

export default QuestionContainer;
