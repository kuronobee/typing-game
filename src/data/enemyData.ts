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
    scale: 0.8,
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
    name: "グレートオーガ",
    level: 4,
    maxHP: 80,
    attackPower: 14,
    defense: 5,
    exp: 120,
    word: "ogre",
    image: new URL("../assets/enemies/great_ogre.png", import.meta.url).toString(),
    scale: 1.8,
    // 独自問題の例：multipleChoice
    originalQuestion: {
      id: "greatOgreQ1",
      type: "multipleChoice",
      prompt: "Which monster wields a huge spiked club?",
      answer: "ogre",
      choices: ["slime", "goblin", "ogre"],
    },
  },
  {
    name: "ゴーレム",
    level: 4,
    maxHP: 90,
    attackPower: 18,
    defense: 12,
    exp: 200,
    word: "golem",
    // 実際のファイル名に合わせて変更してください
    image: new URL("../assets/enemies/golem.png", import.meta.url).toString(),
    scale: 1.8,
    originalQuestion: {
      id: "golemQ1",
      type: "multipleChoice",
      prompt: "Which monster is made of earth or clay?",
      answer: "golem",
      choices: ["slime", "goblin", "golem"],
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
    scale: 2.0,
    // 例：ドラゴン独自の multipleChoice 問題
    originalQuestion: {
      id: "dragon1",
      type: "multipleChoice",
      prompt: "Which creature breathes fire?",
      answer: "dragon",
      choices: ["dragon", "slime", "goblin"],
    },
  },
  {
    name: "マグマゴーレム",
    level: 7,
    maxHP: 180,
    attackPower: 28,
    defense: 15,
    exp: 400,
    word: "magma",
    // 実際に用意しているファイル名にあわせて変更してください
    image: new URL("../assets/enemies/magma_golem.png", import.meta.url).toString(),
    scale: 1.8,
    originalQuestion: {
      id: "magmaGolemQ1",
      type: "multipleChoice",
      prompt: "Which golem is formed from molten rock?",
      answer: "magma",
      choices: ["magma", "golem", "basilisk"],
    },
  },  
  {
    name: "アークデーモン",
    level: 8,
    maxHP: 150,
    attackPower: 25,
    defense: 15,
    exp: 500,
    word: "arcdemon",
    image: new URL("../assets/enemies/arcdemon.png", import.meta.url).toString(),
    scale: 3.0,
    // 例：アークデーモン独自の multipleChoice 問題
    originalQuestion: {
      id: "arcdemon1",
      type: "multipleChoice",
      prompt: "Which monster is an arch demon?",
      answer: "arcdemon",
      choices: ["goblin", "dragon", "arcdemon"],
    },
  },  
];

export default enemies;
