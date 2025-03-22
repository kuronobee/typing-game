// src/components/QuestionContainer.tsx - 常にコンパクトモード版
import React, { useState, useEffect } from "react";
import { Question } from "../data/questions";
import { parseQuestionText } from "../utils/questionTextParser";

interface QuestionContainerProps {
  question: Question | null;
  wrongAttempts: number;
  attackProgress: number; // 0～1 の値（例: 0.5なら50%進捗）
  onFullRevealChange: (fullReveal: boolean) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
}

const QuestionContainer: React.FC<QuestionContainerProps> = ({ 
    question, 
    wrongAttempts, 
    attackProgress, 
    onFullRevealChange,
    inputRef,
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

  // 問題文を解析して品詞アイコンを表示
  const renderPrompt = () => {
    if (!question?.prompt) return null;
    return parseQuestionText(question.prompt);
  };

  // ヒント全開示ボタンのクリックハンドラー
  const handleRevealHint = (e: React.MouseEvent) => {
    e.stopPropagation();
    inputRef?.current?.focus();
    setFullReveal(true);
  };

  // ヒント生成関数 - <>で囲まれた部分は最初から表示
  const getHint = (answer: string, wrongAttempts: number): React.ReactNode => {
    // 解答から<>を削除した純粋な答え
    const cleanAnswer = answer.replace(/<|>/g, '');
    
    // fullReveal が true なら答えをそのまま返す（ただし<>を除く）
    if (fullReveal) {
      return cleanAnswer;
    }

    // <>で囲まれた部分を抽出して処理
    const bracketPattern = /<([^>]+)>/g;
    
    // <>以外の部分を_に置き換えたマップを作成
    const revealMap: boolean[] = Array(answer.length).fill(false);
    let match;
    
    // <>で囲まれた部分は最初から表示するようにマーク
    while ((match = bracketPattern.exec(answer)) !== null) {
      const start = match.index + 1; // '<'の次から
      const end = start + match[1].length; // '>'の前まで
      
      for (let i = start; i < end; i++) {
        if (i < answer.length) {
          revealMap[i] = true;
        }
      }
    }
    
    // 部分的にヒントを開く処理 (通常のロジック)
    const nonSpaceIndices: number[] = [];
    
    // 表示するインデックスを収集（すでに表示されていないものから）
    for (let i = 0; i < answer.length; i++) {
      // タグをスキップ
      if (answer[i] === '<' || answer[i] === '>') continue;
      
      // 空白でない && まだ表示されていない文字のインデックスを収集
      if (answer[i] !== ' ' && !revealMap[i]) {
        nonSpaceIndices.push(i);
      }
    }
    
    // 追加のヒントを表示するための順序リスト
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
    
    // ヒントの表示数を計算
    const reveals = Math.min(wrongAttempts, orderList.length);
    
    // 追加のヒントを表示
    for (let i = 0; i < reveals; i++) {
      if (i < orderList.length) {
        const idx = orderList[i];
        revealMap[idx] = true;
      }
    }
    
    // 結果の文字列を構築
    const resultChars: string[] = [];
    let isInBracket = false;
    
    for (let i = 0; i < answer.length; i++) {
      if (answer[i] === '<') {
        isInBracket = true;
        continue;
      } else if (answer[i] === '>') {
        isInBracket = false;
        continue;
      }
      
      if (isInBracket || revealMap[i] || answer[i] === ' ') {
        resultChars.push(answer[i]);
      } else {
        resultChars.push('_');
      }
    }
    
    // アンダースコア間に小スペースを入れて読みやすくする
    return resultChars.join('\u2009'); // Unicode hair space
  };

  // 攻撃ゲージの警告閾値
  const warningThreshold = 0.8;  // 80%で警告開始
  const criticalThreshold = 0.95; // 95%で危険警告
  
  // 攻撃ゲージのクラス判定
  let attackGaugeClass = "";
  let attackBarClass = "bg-red-500";
  
  if (attackProgress >= criticalThreshold) {
    // 95%以上：危険警告
    attackGaugeClass = "attack-gauge-warning attack-gauge-critical";
    attackBarClass = "bg-red-500 animate-attack-ready-flash";
  } else if (attackProgress >= warningThreshold) {
    // 80%以上：通常警告
    attackGaugeClass = "attack-gauge-warning";
    attackBarClass = "bg-red-500 animate-attack-warning";
  }

  // コンパクトモードのみのスタイルとレイアウト
  const containerClasses = `
    relative 
    question-container
    bg-black/50 
    border-white 
    border-[1px] py-1 px-2
    text-white
    rounded
    transition-all 
    duration-300
  `;
  
  // ヒントボタンのスタイル
  const hintButtonClass = `
    w-5 h-5 text-xs mr-1
    bg-blue-500 
    rounded-full 
    flex 
    items-center 
    justify-center 
    hover:bg-blue-600 
    cursor-pointer
  `;
  
  // 常にコンパクトモードとして表示
  return (
    <div className={containerClasses}>
      {/* 攻撃ゲージを小さく上部に表示 - 警告クラスを追加 */}
      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-30 w-100 h-[4px]">
        <div className={`w-full h-full bg-gray-300 rounded-sm ${attackGaugeClass}`}>
          <div
            className={`h-full ${attackBarClass} rounded-sm`}
            style={{ width: `${Math.min(attackProgress * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      {/* 危険警告アイコンを表示（95%以上の場合） */}
      {attackProgress >= criticalThreshold && (
        <div 
          className="absolute top-0 right-1 text-red-500 animate-pulse z-40 text-xs"
        >
          ⚠️
        </div>
      )}
      
      {/* 内容を一行に集約 */}
      <div className="flex flex-col pt-1">
        <div className="flex-1 p-1 pl-5 text-sm">{renderPrompt()}</div>
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
};

export default QuestionContainer;