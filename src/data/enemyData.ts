// src/data/enemyData.ts
import { Question } from "./questions";
import {IEnemyData} from "../models/EnemyModel"


const enemies: IEnemyData[] = [
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
    speed: 200, // 例: 低速
    // originalQuestion はなし
  },
  {
    name: "ゴブリン",
    level: 1,
    maxHP: 30,
    attackPower: 7,
    defense: 3,
    exp: 80,
    word: "goblin",
    image: new URL("../assets/enemies/goblin.png", import.meta.url).toString(),
    scale: 1.2,
    speed: 120, // 例: やや速い
    originalQuestion: {
      id: "goblin1",
      type: "word",
      prompt: "小さな怪物",
      answer: "goblin",
    },
    specialAttacks: [
      {
        name: "fire breath",
        probability: 1,
        damage: 30,
        perform: (enemy, player) => {
          console.log(`${enemy.name} uses Fire Breath!`);
          // 例として、プレイヤーに30のダメージを与える
          // ここはプレイヤーのダメージ処理に合わせて実装してください
          
        },
      },
    ]
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
    speed: 80,
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
    image: new URL("../assets/enemies/golem.png", import.meta.url).toString(),
    scale: 1.8,
    speed: 70,
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
    speed: 200,
    originalQuestion: {
      id: "dragon1",
      type: "multipleChoice",
      prompt: "Which creature breathes fire?",
      answer: "dragon",
      choices: ["dragon", "slime", "goblin"],
    },
    // 30% の確率で火炎攻撃、20% の確率で自己回復
    specialAttacks: [
      {
        name: "fire breath",
        probability: 0.3,
        perform: (enemy, player) => {
          console.log(`${enemy.name} uses Fire Breath!`);
          // 例として、プレイヤーに30のダメージを与える
          // ここはプレイヤーのダメージ処理に合わせて実装してください
          // player.takeDamage(30);
        },
      },
      {
        name: "self-heal",
        probability: 0.2,
        perform: (enemy, player) => {
          console.log(`${enemy.name} heals itself!`);
          // 自己回復：現在HPを20回復。ただし、maxHP を超えないように
          enemy.currentHP = Math.min(enemy.currentHP + 20, enemy.maxHP);
        },
      },
    ],
  },
  {
    name: "マグマゴーレム",
    level: 7,
    maxHP: 180,
    attackPower: 28,
    defense: 15,
    exp: 400,
    word: "magma",
    image: new URL("../assets/enemies/magma_golem.png", import.meta.url).toString(),
    scale: 1.8,
    speed: 150,
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
    speed: 220,
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
