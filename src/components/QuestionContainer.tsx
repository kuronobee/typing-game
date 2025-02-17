// src/components/QuestionContainer.tsx
import React from "react";
import { Question } from "../data/questions";

interface QuestionContainerProps {
  question: Question;
  wrongAttempts: number;
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({ question, wrongAttempts }) => {
  // ヒントを生成する関数（BattleStage.tsx から流用）
  const getHint = (answer: string, wrongAttempts: number): string => {
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
    <div
      className="absolute top-10 left-1/2 transform -translate-x-1/2 z-30 bg-black/50 border-white border-2 text-white px-4 py-2 rounded"
    >
      <p className="font-bold">問題: {question.prompt}</p>
      <p className="mt-2">ヒント: {getHint(question.answer, wrongAttempts)}</p>
    </div>
  );
};

export default QuestionContainer;
