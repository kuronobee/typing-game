// src/models/EnemyModel.ts
import { stringify } from "postcss";
import {useState} from "react";

import { Player, StatusEffect } from "./Player";
import { Question, commonQuestions } from "../data/questions";

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
  originalQuestions?: Question[];
  questionMode: "original" | "common" | "both";
  specialAttacks?: SpecialAttack[];
}

export interface SpecialAttack {
  name: string;
  // probability: 0～1の数値。複数ある場合は合計が1未満なら通常攻撃も行われる
  probability: number;
  // damage: 攻撃によるダメージ（必ずしもダメージを与えない特殊攻撃もある
  // performは特殊攻撃実行時の追加効果を行うための関数
  // damage: 特殊攻撃のダメージ量, recovery: 特殊攻撃の回復量, message: 特殊攻撃のメッセージ
  perform: (
    enemy: Enemy,
    player: Player
  ) => {
    damage: number;
    recovery: number;
    statusEffects: StatusEffect[];
    message: string;
  };
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
  questionMode: "original" | "common" | "both";
  originalQuestions?: Question[]; // 敵が持つ、オリジナル問題
  private _presentedQuestion: Question | null;
  specialAttacks: SpecialAttack[];
  defeated: boolean;

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
    this.questionMode = "common";
    this.originalQuestions = [];
    this._presentedQuestion = null;
    this.specialAttacks = data.specialAttacks || [];
    this.defeated = false;
  }

  public get presentedQuestion(): Question | null {
    return this._presentedQuestion;
  }

  // ダメージを受ける処理（内部ロジック）
  takeDamage(amount: number): void {
    this.currentHP = Math.max(this.currentHP - amount, 0);
    if (this.currentHP === 0) {
      this.defeated = true;
    }
  }

  // 復活メソッド（今後の復活魔法の実装に備える）
  revive(): void {
    this.currentHP = this.maxHP;
    this.defeated = false;
  }

  // 攻撃を行う（例としてランダムな値を用いたシンプルなダメージ計算）
  performAttack(player: Player): {
    result: {
      damage: number;
      recovery: number;
      statusEffects: StatusEffect[];
      message: string;
    };
    special?: string;
  } {
    // 複数の特殊攻撃が設定されている場合、ランダムに選んで発動する
    if (this.specialAttacks.length > 0) {
      const rand = Math.random(); // 0〜1 の乱数
      let cumulative = 0;
      for (const attack of this.specialAttacks) {
        cumulative += attack.probability;
        if (rand < cumulative) {
          // 特殊攻撃発動
          const result = attack.perform(this, player);
          return { result, special: attack.name };
        }
      }
    }
    // 特殊攻撃が発動しなかった場合、通常攻撃
    const damage = Math.max(
      this.attackPower - Math.floor(Math.random() * 3),
      1
    );
    return {
      result: { damage: damage, recovery: 0, statusEffects: [], message: "" },
      special: "",
    };
  }

  // getNextQuestion method now uses 'question' property
  public getNextQuestion(): Question {
    if (this.questionMode === "original") {
      this._presentedQuestion = (this.originalQuestions ? this.originalQuestions[Math.floor(Math.random() * this.originalQuestions.length)]        
      : commonQuestions[Math.floor(Math.random() * commonQuestions.length)]);
    } else if (this.questionMode === "common") {
      this._presentedQuestion = commonQuestions[
        Math.floor(Math.random() * commonQuestions.length)
      ];
    } else if (this.questionMode === "both") {
      if (this.originalQuestions && Math.random() < 0.5) {
        this._presentedQuestion = this.originalQuestions[Math.floor(Math.random() * this.originalQuestions.length)];
      } else {
        this._presentedQuestion = commonQuestions[
          Math.floor(Math.random() * commonQuestions.length)
        ];
      }
    }
    else {
      this._presentedQuestion = commonQuestions[Math.floor(Math.random() * commonQuestions.length)];
    }
    return this._presentedQuestion;
  }
  // ここにさらに、特殊攻撃や状態異常などのメソッドを追加可能
}
