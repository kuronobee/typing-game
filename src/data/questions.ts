// src/data/questions.ts
export interface Question {
  id: string;
  type: "word" | "phrase" | "kanji" | "multipleChoice";
  prompt: string; // ユーザーに表示する問題文（例："猫"、"おはよう"、"火を吹く生き物は？"）
  answer: string; // 正答（例："cat"、"good morning"、"dragon"）
  choices?: string[]; // multipleChoice の場合の選択肢
}

export const commonQuestions: Question[] = [
  {
    id: "q1",
    type: "word",
    prompt: "繁栄",
    answer: "prosperity",
  },
  {
    id: "q2",
    type: "word",
    prompt: "実行、遂行",
    answer: "execution",
  },
  {
    id: "q3",
    type: "word",
    prompt: "回復、復旧",
    answer: "restoration",
  },
  {
    id: "q4",
    type: "word",
    prompt: "革新、改革",
    answer: "innovation",
  },
  {
    id: "q5",
    type: "word",
    prompt: "耐久性",
    answer: "durability",
  },
  {
    id: "q6",
    type: "word",
    prompt: "破片、断片",
    answer: "fragment",
  },
  {
    id: "q7",
    type: "word",
    prompt: "混乱、騒動",
    answer: "turmoil",
  },
  {
    id: "q8",
    type: "word",
    prompt: "妥協、折衷",
    answer: "compromise",
  },
  {
    id: "q9",
    type: "word",
    prompt: "優位性、優越",
    answer: "superiority",
  },
  {
    id: "q10",
    type: "word",
    prompt: "信用、信頼",
    answer: "credibility",
  },
  {
    id: "q11",
    type: "word",
    prompt: "偏見",
    answer: "bias",
  },
  {
    id: "q12",
    type: "word",
    prompt: "同盟、連携",
    answer: "alliance",
  },
  {
    id: "q13",
    type: "word",
    prompt: "対照、対比",
    answer: "contrast",
  },
  {
    id: "q14",
    type: "word",
    prompt: "分離、隔離",
    answer: "segregation",
  },
  {
    id: "q15",
    type: "word",
    prompt: "義務、責任",
    answer: "obligation",
  },
  {
    id: "q16",
    type: "word",
    prompt: "進展、発展",
    answer: "advancement",
  },
  {
    id: "q17",
    type: "word",
    prompt: "一貫性",
    answer: "consistency",
  },
  {
    id: "q18",
    type: "word",
    prompt: "影響力",
    answer: "influence",
  },
  {
    id: "q19",
    type: "word",
    prompt: "証拠",
    answer: "evidence",
  },
  {
    id: "q20",
    type: "word",
    prompt: "不況、景気後退",
    answer: "recession",
  },
  {
    id: "q21",
    type: "word",
    prompt: "機密情報",
    answer: "confidentiality",
  },
  {
    id: "q22",
    type: "word",
    prompt: "意図、目的",
    answer: "intention",
  },
  {
    id: "q23",
    type: "word",
    prompt: "変異、変化",
    answer: "mutation",
  },
  {
    id: "q24",
    type: "word",
    prompt: "評価、査定",
    answer: "assessment",
  },
  {
    id: "q25",
    type: "word",
    prompt: "改革、修正",
    answer: "revision",
  },
  {
    id: "q26",
    type: "word",
    prompt: "協力、連携",
    answer: "cooperation",
  },
  {
    id: "q27",
    type: "word",
    prompt: "脆弱性",
    answer: "vulnerability",
  },
  {
    id: "q28",
    type: "word",
    prompt: "生存",
    answer: "survival",
  },
  {
    id: "q29",
    type: "word",
    prompt: "堅実性",
    answer: "stability",
  },
  {
    id: "q30",
    type: "word",
    prompt: "権限、権威",
    answer: "authority",
  },
  {
    id: "q31",
    type: "word",
    prompt: "縮小、削減",
    answer: "reduction",
  },
  {
    id: "q32",
    type: "word",
    prompt: "解決策",
    answer: "solution",
  },
  {
    id: "q33",
    type: "word",
    prompt: "相互関係",
    answer: "correlation",
  },
  {
    id: "q34",
    type: "word",
    prompt: "貢献",
    answer: "contribution",
  },
  {
    id: "q35",
    type: "word",
    prompt: "違反、侵害",
    answer: "violation",
  },
  {
    id: "q36",
    type: "word",
    prompt: "忍耐",
    answer: "patience",
  },
  {
    id: "q37",
    type: "word",
    prompt: "補助、支援",
    answer: "assistance",
  },
  {
    id: "q38",
    type: "word",
    prompt: "利益",
    answer: "benefit",
  },
  {
    id: "q39",
    type: "word",
    prompt: "明快さ",
    answer: "clarity",
  },
  {
    id: "q40",
    type: "word",
    prompt: "探求",
    answer: "exploration",
  },
];
