// src/data/enemyData.ts
import { Question } from "./questions";

export interface EnemyType {
  name: string;
  level: number;
  maxHP: number;
  currentHP?: number; // 出現時に maxHP で初期化
  attackPower: number;
  defense: number;
  exp: number;
  word: string;
  image: string;
  positionOffset?: { x: number; y: number };
  scale?: number;
  // 各敵が保持するオリジナル問題（任意）
  originalQuestion?: Question;
}

const enemies: EnemyType[] = [
  {
    name: "スライム",
    level: 1,
    maxHP: 20,
    attackPower: 5,
    defense: 2,
    exp: 50,
    word: "slime",
    image: new URL("../assets/enemies/slime.png", import.meta.url).toString(),
    scale: 1,
    // オリジナル問題はなし → 共通問題が使用される
  },
  {
    name: "ゴブリン",
    level: 2,
    maxHP: 30,
    attackPower: 7,
    defense: 3,
    exp: 80,
    word: "goblin",
    image: new URL("../assets/enemies/goblin.png", import.meta.url).toString(),
    scale: 1.2,
    // 例：ゴブリン独自の問題（日本語→英語）
    originalQuestion: {
      id: "goblin1",
      type: "word",
      prompt: "小さな怪物",
      answer: "goblin",
    },
  },
  {
    name: "ドラゴン",
    level: 5,
    maxHP: 100,
    attackPower: 20,
    defense: 10,
    exp: 300,
    word: "dragon",
    image: new URL("../assets/enemies/dragon.png", import.meta.url).toString(),
    scale: 1.5,
    // 例：ドラゴン独自の multipleChoice 問題
    originalQuestion: {
      id: "dragon1",
      type: "multipleChoice",
      prompt: "Which creature breathes fire?",
      answer: "dragon",
      choices: ["dragon", "slime", "goblin"],
    },
  },
];

export default enemies;
