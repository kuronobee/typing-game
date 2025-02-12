// src/data/questions.ts
export interface Question {
    id: string;
    type: "word" | "phrase" | "kanji" | "multipleChoice";
    prompt: string;      // ユーザーに表示する問題文（例："猫"、"おはよう"、"火を吹く生き物は？"）
    answer: string;      // 正答（例："cat"、"good morning"、"dragon"）
    choices?: string[];  // multipleChoice の場合の選択肢
  }
  
  export const commonQuestions: Question[] = [
    {
      id: "q1",
      type: "word",
      prompt: "犬",
      answer: "dog",
    },
    {
      id: "q2",
      type: "phrase",
      prompt: "おはよう",
      answer: "good morning",
    },
    // 必要に応じて追加
  ];
  