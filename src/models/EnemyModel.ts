// src/models/EnemyModel.ts

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
  }

  // ダメージを受ける処理（内部ロジック）
  takeDamage(amount: number): void {
    this.currentHP = Math.max(this.currentHP - amount, 0);
  }

  // 攻撃を行う（例としてランダムな値を用いたシンプルなダメージ計算）
  performAttack(): number {
    const damage = Math.max(this.attackPower - Math.floor(Math.random() * 3), 1);
    return damage;
  }

  // ここにさらに、特殊攻撃や状態異常などのメソッドを追加可能
}
