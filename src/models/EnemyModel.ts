// src/models/EnemyModel.ts
import { stringify } from "postcss";
import {Player} from "./Player";

export interface IEnemyData {
  name: string;
  level: number;
  maxHP: number;
  attackPower: number;
  defense: number;
  exp: number;
  speed: number;
  word: string;
  image: string;
  positionOffset?: { x: number; y: number };
  scale?: number;
  originalQuestion?: any; // Question型などに置き換えてください
  specialAttacks?: SpecialAttack[];
}

export interface SpecialAttack {
  name: string;
  // probability: 0～1の数値。複数ある場合は合計が1未満なら通常攻撃も行われる
  probability: number;
  // damage: 攻撃によるダメージ（必ずしもダメージを与えない特殊攻撃もある
  // performは特殊攻撃実行時の追加効果を行うための関数
  perform: (enemy: Enemy, player: Player) => {damage: number, recovery: number, message: string};
}

export class Enemy {
  name: string;
  level: number;
  maxHP: number;
  currentHP: number;
  attackPower: number;
  defense: number;
  exp: number;
  speed: number;
  word: string;
  image: string;
  positionOffset?: { x: number; y: number };
  scale?: number;
  originalQuestion?: any;
  specialAttacks: SpecialAttack[];

  constructor(data: IEnemyData) {
    this.name = data.name;
    this.level = data.level;
    this.maxHP = data.maxHP;
    // 敵が出現したら currentHP は最大HP で初期化
    this.currentHP = data.maxHP;
    this.attackPower = data.attackPower;
    this.defense = data.defense;
    this.exp = data.exp;
    this.speed = data.speed;
    this.word = data.word;
    this.image = data.image;
    this.positionOffset = data.positionOffset;
    this.scale = data.scale;
    this.originalQuestion = data.originalQuestion;
    this.specialAttacks = data.specialAttacks || [];
  }

  // ダメージを受ける処理（内部ロジック）
  takeDamage(amount: number): void {
    this.currentHP = Math.max(this.currentHP - amount, 0);
  }

  // 攻撃を行う（例としてランダムな値を用いたシンプルなダメージ計算）
  performAttack(player: Player): {result: {damage: number, recovery: number, message: string}; special?: string; message?: string} {
    // 複数の特殊攻撃が設定されている場合、ランダムに選んで発動する
    if (this.specialAttacks.length > 0) {
      const rand = Math.random(); // 0〜1 の乱数
      let cumulative = 0;
      for (const attack of this.specialAttacks) {
        cumulative += attack.probability;
        if (rand < cumulative) {
          // 特殊攻撃発動
          const result = attack.perform(this, player);
          return {result, special: attack.name, message: attack.message};
        }
      }
    }
    // 特殊攻撃が発動しなかった場合、通常攻撃
    const damage = Math.max(this.attackPower - Math.floor(Math.random() * 3), 1);
    return {result: { damage: damage, recovery: 0, message: ""}, special: "", message: ""};  
  }
  // ここにさらに、特殊攻撃や状態異常などのメソッドを追加可能
}
