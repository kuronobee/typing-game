// src/models/Player.ts

export interface IPlayer {
  hp: number;
  maxHP: number;
  mp: number;
  maxMP: number;
  defense: number;
  level: number;
  exp: number;
  totalExp: number;
  speed: number;
  attack: number;
}

export class Player implements IPlayer {
  hp: number;
  maxHP: number;
  mp: number;
  maxMP: number;
  defense: number;
  level: number;
  exp: number;
  totalExp: number;
  speed: number;
  attack: number;

  constructor(
    hp: number,
    maxHP: number,
    mp: number,
    maxMP: number,
    defense: number,
    level: number,
    exp: number,
    totalExp: number,
    speed: number,
    attack: number
  ) {
    this.hp = hp;
    this.maxHP = maxHP;
    this.mp = mp;
    this.maxMP = maxMP;
    this.defense = defense;
    this.level = level;
    this.exp = exp;
    this.totalExp = totalExp;
    this.speed = speed;
    this.attack = attack;
  }

  // デフォルトのプレイヤー状態を返す
  static createDefault(): Player {
    // 例: HP=100, MP=50, defense=5, level=1, exp=0, speed=10, attack=10
    return new Player(100, 100, 50, 50, 5, 1, 0, 0, 10, 10);
  }

  // 現在のレベルに応じたレベルアップに必要な経験値の閾値
  get levelUpThreshold(): number {
    return this.level * 100; // 例として、レベル × 100
  }

  // 経験値を加算し、レベルアップ処理を行い新しいインスタンスを返す
  addExp(amount: number): Player {
    const newExp = this.exp + amount;
    const newTotalExp = this.totalExp + amount;
    let newLevel = this.level;
    let remainingExp = newExp;
    let newMaxHP = this.maxHP;
    let newMaxMP = this.maxMP;
    let newHp = this.hp;
    let newMp = this.mp;
    let newAttack = this.attack;
    // 閾値は this.levelUpThreshold を使う
    let threshold = this.levelUpThreshold;

    while (remainingExp >= threshold) {
      remainingExp -= threshold;
      newLevel++;
      newMaxHP += 10;  // 最大HP 増加
      newMaxMP += 5;   // 最大MP 増加
      // レベルアップ時に HP/MP を全回復する
      newHp = newMaxHP;
      newMp = newMaxMP;
      newAttack += 2;
      threshold = newLevel * 100;
    }

    return new Player(newHp, newMaxHP, newMp, newMaxMP, this.defense, newLevel, remainingExp, newTotalExp, this.speed, newAttack);
  }

  // ダメージを受けた場合、新しいインスタンスを返す
  takeDamage(amount: number): Player {
    const newHp = Math.max(this.hp - amount, 0);
    return new Player(newHp, this.maxHP, this.mp, this.maxMP, this.defense, this.level, this.exp, this.totalExp, this.speed, this.attack);
  }
}
