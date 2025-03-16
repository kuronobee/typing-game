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
    prompt: "繁栄[名]",
    answer: "prosperity",
  },
  {
    id: "q2",
    type: "word",
    prompt: "実行、遂行[名]",
    answer: "execution",
  },
  {
    id: "q3",
    type: "word",
    prompt: "回復、復旧[名]",
    answer: "restoration",
  },
  {
    id: "q4",
    type: "word",
    prompt: "革新、改革[名]",
    answer: "innovation",
  },
  {
    id: "q5",
    type: "word",
    prompt: "耐久性[名]",
    answer: "durability",
  },
  {
    id: "q6",
    type: "word",
    prompt: "破片、断片[名]",
    answer: "fragment",
  },
  {
    id: "q7",
    type: "word",
    prompt: "混乱、騒動[名]",
    answer: "turmoil",
  },
  {
    id: "q8",
    type: "word",
    prompt: "妥協、折衷[名]",
    answer: "compromise",
  },
  {
    id: "q9",
    type: "word",
    prompt: "優位性、優越[名]",
    answer: "superiority",
  },
  {
    id: "q10",
    type: "word",
    prompt: "信用、信頼[名]",
    answer: "credibility",
  },
  {
    id: "q11",
    type: "word",
    prompt: "偏見[名]",
    answer: "bias",
  },
  {
    id: "q12",
    type: "word",
    prompt: "同盟、連携[名]",
    answer: "alliance",
  },
  {
    id: "q13",
    type: "word",
    prompt: "対照、対比[名]",
    answer: "contrast",
  },
  {
    id: "q14",
    type: "word",
    prompt: "分離、隔離[名]",
    answer: "segregation",
  },
  {
    id: "q15",
    type: "word",
    prompt: "義務、責任[名]",
    answer: "obligation",
  },
  {
    id: "q16",
    type: "word",
    prompt: "進展、発展[名]",
    answer: "advancement",
  },
  {
    id: "q17",
    type: "word",
    prompt: "一貫性[名]",
    answer: "consistency",
  },
  {
    id: "q18",
    type: "word",
    prompt: "影響力[名]",
    answer: "influence",
  },
  {
    id: "q19",
    type: "word",
    prompt: "証拠[名]",
    answer: "evidence",
  },
  {
    id: "q20",
    type: "word",
    prompt: "不況、景気後退[名]",
    answer: "recession",
  },
  {
    id: "q21",
    type: "word",
    prompt: "機密情報[名]",
    answer: "confidentiality",
  },
  {
    id: "q22",
    type: "word",
    prompt: "意図、目的[名]",
    answer: "intention",
  },
  {
    id: "q23",
    type: "word",
    prompt: "変異、変化[名]",
    answer: "mutation",
  },
  {
    id: "q24",
    type: "word",
    prompt: "評価、査定[名]",
    answer: "assessment",
  },
  {
    id: "q25",
    type: "word",
    prompt: "改革、修正[名]",
    answer: "<re>vision",
  },
  {
    id: "q26",
    type: "word",
    prompt: "協力、連携[名]",
    answer: "cooperation",
  },
  {
    id: "q27",
    type: "word",
    prompt: "脆弱性[名]",
    answer: "vulnerability",
  },
  {
    id: "q28",
    type: "word",
    prompt: "生存[名]",
    answer: "survival",
  },
  {
    id: "q29",
    type: "word",
    prompt: "堅実性[名]",
    answer: "stability",
  },
  {
    id: "q30",
    type: "word",
    prompt: "権限、権威[名]",
    answer: "authority",
  },
  {
    id: "q31",
    type: "word",
    prompt: "縮小、削減[名]",
    answer: "reduction",
  },
  {
    id: "q32",
    type: "word",
    prompt: "解決策[名]",
    answer: "solution",
  },
  {
    id: "q33",
    type: "word",
    prompt: "相互関係[名]",
    answer: "correlation",
  },
  {
    id: "q34",
    type: "word",
    prompt: "貢献[名]",
    answer: "contribution",
  },
  {
    id: "q35",
    type: "word",
    prompt: "違反、侵害[名]",
    answer: "violation",
  },
  {
    id: "q36",
    type: "word",
    prompt: "忍耐[名]",
    answer: "patience",
  },
  {
    id: "q37",
    type: "word",
    prompt: "補助、支援[名]",
    answer: "assistance",
  },
  {
    id: "q38",
    type: "word",
    prompt: "利益[名]",
    answer: "benefit",
  },
  {
    id: "q39",
    type: "word",
    prompt: "明快さ[名]",
    answer: "clarity",
  },
  {
    id: "q40",
    type: "word",
    prompt: "探求[名]",
    answer: "exploration",
  },
    // 動詞
    {
        id: "v1",
        type: "word",
        prompt: "分析する[動]",
        answer: "analyze",
      },
      {
        id: "v2",
        type: "word",
        prompt: "達成する[動]",
        answer: "achieve",
      },
      {
        id: "v3",
        type: "word",
        prompt: "貢献する[動]",
        answer: "contribute",
      },
      {
        id: "v4",
        type: "word",
        prompt: "妨げる[動]",
        answer: "prevent",
      },
      {
        id: "v5",
        type: "word",
        prompt: "実装する[動]",
        answer: "implement",
      },
      
      // 形容詞
      {
        id: "adj1",
        type: "word",
        prompt: "効率的な[形]",
        answer: "efficient",
      },
      {
        id: "adj2",
        type: "word",
        prompt: "重要な[形]",
        answer: "significant",
      },
      {
        id: "adj3",
        type: "word",
        prompt: "信頼できる[形]",
        answer: "reliable",
      },
      {
        id: "adj4",
        type: "word",
        prompt: "多様な[形]",
        answer: "diverse",
      },
      {
        id: "adj5",
        type: "word",
        prompt: "柔軟な[形]",
        answer: "flexible",
      },
      
      // 副詞
      {
        id: "adv1",
        type: "word",
        prompt: "最終的に[副]",
        answer: "<e>ventually",
      },
      {
        id: "adv2",
        type: "word",
        prompt: "特に[副]",
        answer: "<p>articularly",
      },
      {
        id: "adv3",
        type: "word",
        prompt: "確実に[副]",
        answer: "definitely",
      },
      {
        id: "adv4",
        type: "word",
        prompt: "頻繁に[副]",
        answer: "frequently",
      },
      {
        id: "adv5",
        type: "word",
        prompt: "急速に[副]",
        answer: "rapidly",
      },
      
      // 前置詞
      {
        id: "prep1",
        type: "word",
        prompt: "～にもかかわらず[前]",
        answer: "despite",
      },
      {
        id: "prep2",
        type: "word",
        prompt: "～に関して[前]",
        answer: "regarding",
      },
      {
        id: "prep3",
        type: "word",
        prompt: "～を通して[前]",
        answer: "throughout",
      },
      
      // 複合的な例
      {
        id: "c1",
        type: "word",
        prompt: "継続的に[副]学ぶ[動]",
        answer: "continuously learn",
      },
      {
        id: "c2",
        type: "word",
        prompt: "重要な[形]要素[名]",
        answer: "crucial element",
      },
      {
        id: "c3",
        type: "word",
        prompt: "効果的に[副]実施する[動]",
        answer: "effectively implement",
      }
];

// src/data/questions.ts に追加するデータ
// 既存の問題データの一部を置き換えるか、新しく追加

export const commonQuestionsWithPartOfSpeech: Question[] = [
  {
    id: "p1",
    type: "word",
    prompt: "繁栄 [名]",
    answer: "prosperity",
  },
  {
    id: "p2",
    type: "word",
    prompt: "実行、遂行 [名]",
    answer: "execution",
  },
  {
    id: "p3",
    type: "word",
    prompt: "回復する [動]",
    answer: "recover",
  },
  {
    id: "p4",
    type: "word",
    prompt: "革新的な [形]",
    answer: "innovative",
  },
  {
    id: "p5",
    type: "word",
    prompt: "慎重に [副]",
    answer: "carefully",
  },
  {
    id: "p6",
    type: "word",
    prompt: "～に関して [前]",
    answer: "regarding",
  },
  {
    id: "p7",
    type: "word",
    prompt: "そして [接]",
    answer: "and",
  },
  {
    id: "p8",
    type: "word",
    prompt: "～できる [助]",
    answer: "can",
  },
  {
    id: "p9",
    type: "word",
    prompt: "彼ら [代]",
    answer: "they",
  },
  {
    id: "p10",
    type: "word",
    prompt: "早く走る [動] 人 [名]",
    answer: "fast runner",
  },
];

// 既存のcommonQuestions配列を更新するには以下のようにします
// コードの適切な場所に挿入してください
// 例: src/data/questions.ts の最後に追加

// commonQuestionsを拡張
export const allCommonQuestions = [
  ...commonQuestions,
  ...commonQuestionsWithPartOfSpeech,
];

// または既存のcommonQuestionsの一部を置き換える
// commonQuestions.splice(0, 10, ...commonQuestionsWithPartOfSpeech);
