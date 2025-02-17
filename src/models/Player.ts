// src/models/Player.ts
export type StatusEffect = {
  type: "poison";
  ticks: number;         // 例：毒状態が持続する tick 数（例：5 tick＝5秒）
  damagePerTick: number; // 毒1 tickあたりのダメージ
};

export interface IPlayer {
  hp: number;
  maxHP: number;
  mp: number;
  maxMP: number;
  defense: number;
  magicDefense: number;
  level: number;
  exp: number;
  totalExp: number;
  speed: number;
  attack: number;
  statusEffects: StatusEffect[];
}

export class Player implements IPlayer {
  hp: number;
  maxHP: number;
  mp: number;
  maxMP: number;
  defense: number;
  magicDefense: number;
  level: number;
  exp: number;
  totalExp: number;
  speed: number;
  attack: number;
  statusEffects: StatusEffect[];

  constructor(
    hp: number,
    maxHP: number,
    mp: number,
    maxMP: number,
    defense: number,
    magicDefense: number,
    level: number,
    exp: number,
    totalExp: number,
    speed: number,
    attack: number,
    statusEffects: StatusEffect[] = []
  ) {
    this.hp = hp;
    this.maxHP = maxHP;
    this.mp = mp;
    this.maxMP = maxMP;
    this.defense = defense;
    this.magicDefense = magicDefense;
    this.level = level;
    this.exp = exp;
    this.totalExp = totalExp;
    this.speed = speed;
    this.attack = attack;
    this.statusEffects = statusEffects;
  }

  // デフォルトのプレイヤー状態を返す
  static createDefault(): Player {
    // 例: HP=100, MP=50, defense=5, level=1, exp=0, speed=10, attack=10
    return new Player(100, 100, 50, 50, 5, 5, 1, 0, 0, 10, 10, []);
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
    let newDefense = this.defense;
    let newMagicDefense = this.magicDefense;
    let newAttack = this.attack;
    let newSpeed = this.speed;
    // 閾値は this.levelUpThreshold を使う
    let threshold = this.levelUpThreshold;

    while (remainingExp >= threshold) {
      remainingExp -= threshold;
      newLevel++;
      newMaxHP += 10;  // 最大HP 増加
      newMaxMP += 5;   // 最大MP 増加
      newMagicDefense += 1; // 魔法防御力増加
      newDefense += 1; // 防御力増加
      newSpeed += 1; // スピード増加
      // レベルアップ時に HP/MP を全回復する
      newHp = newMaxHP;
      newMp = newMaxMP;
      newAttack += 2;
      threshold = newLevel * 100;
    }

    return new Player(
      newHp, 
      newMaxHP, 
      newMp, 
      newMaxMP, 
      newDefense, 
      newMagicDefense, 
      newLevel, 
      remainingExp, 
      newTotalExp, 
      newSpeed, 
      newAttack, 
      this.statusEffects);
  }

  // ダメージを受けた場合、新しいインスタンスを返す
  takeDamage(amount: number): Player {
    const newHp = Math.max(this.hp - amount, 0);
    return new Player(
      newHp,
      this.maxHP, 
      this.mp, 
      this.maxMP, 
      this.defense, 
      this.magicDefense, 
      this.level, 
      this.exp, 
      this.totalExp, 
      this.speed, 
      this.attack,
      this.statusEffects);
  }

  // 状態異常を適用するメソッド
  applyStatusEffect(effect: StatusEffect): Player {
    // 既に同じ種類がある場合は上書きや累積のロジックを入れても良い
    return new Player(
      this.hp,
      this.maxHP,
      this.mp,
      this.maxMP,
      this.defense,
      this.magicDefense,
      this.level,
      this.exp,
      this.totalExp,
      this.speed,
      this.attack,
      [...this.statusEffects, effect]
    );
  }

  // 複数の状態異常をまとめて追加する（重複するものは追加しない）
  applyStatusEffects(effects: StatusEffect[]): Player {
    console.log("applyStatusEffects: effects", effects);
    // 新たに追加する効果は、すでに存在するものと重複しないものに絞る
    const newEffects = effects.filter(
      effect => !this.statusEffects.some(existing => existing.type === effect.type)
    );
    return new Player(
      this.hp,
      this.maxHP,
      this.mp,
      this.maxMP,
      this.defense,
      this.magicDefense,
      this.level,
      this.exp,
      this.totalExp,
      this.speed,
      this.attack,
      [...this.statusEffects, ...newEffects]
    );
  }
  // 状態異常の更新（例：tick数を減らす、終了したものは除去する）
  updateStatusEffects(newEffects: StatusEffect[]): Player {
    return new Player(
      this.hp,
      this.maxHP,
      this.mp,
      this.maxMP,
      this.defense,
      this.magicDefense,
      this.level,
      this.exp,
      this.totalExp,
      this.speed,
      this.attack,
      newEffects
    );
  }

  // 状態異常の type を文字列で指定して除去するメソッド
  removeStatusEffects(removeType: string): Player {
    const newStatusEffects = this.statusEffects.filter(
      effect => effect.type !== removeType
    );
    return new Player(
      this.hp,
      this.maxHP,
      this.mp,
      this.maxMP,
      this.defense,
      this.magicDefense,
      this.level,
      this.exp,
      this.totalExp,
      this.speed,
      this.attack,
      newStatusEffects
    );
  }
}
