// src/data/constants.ts

// 敵の effectiveSpeed の最大値
export const MAX_EFFECTIVE_SPEED = 1000;

// 1秒あたりのミリ秒数
export const MS_IN_SECOND = 1000;

// タイマーの tick 間隔（ミリ秒）
export const TICK_INTERVAL = 50;

// 敵攻撃時のヒットアニメーションの継続時間（ミリ秒）
export const ENEMY_HIT_ANIMATION_DURATION = 300;
export const PLAYER_HIT_ANIMATION_DURATION = 300;
export const PLAYER_FIREBREATH_ANIMATION_DURATION = 300;
// レベルアップ時のメッセージ表示時間（ミリ秒）
export const LEVEL_UP_MESSAGE_DURATION = 5000;

// 経験値獲得時の表示持続時間（ミリ秒）
export const EXP_GAIN_DISPLAY_DURATION = 2000;

// 入力フィールドにフォーカスを戻す際の遅延（ミリ秒）
export const INPUT_FOCUS_DELAY = 100;

// 戦闘中のメッセージ表示時間（ミリ秒）
export const MESSAGE_DISPLAY_DURATION = 3000;

// プレイヤーの初期ステータス
export const INITIAL_PLAYER_HP = 100;
export const INITIAL_PLAYER_MP = 50;
export const INITIAL_PLAYER_SPEED = 10;
export const INITIAL_PLAYER_LEVEL = 100;
export const INITIAL_PLAYER_EXP = 0;
export const INITIAL_PLAYER_TOTAL_EXP = 0;

// プレイヤー攻撃力の基本値とレベルアップごとの増加値
export const BASE_PLAYER_ATTACK = 10;
export const PLAYER_ATTACK_LEVEL_MULTIPLIER = 2;

// レベルアップに必要な経験値の倍率（例：Lv1なら100, Lv2なら200, ...）
export const LEVEL_UP_EXP_MULTIPLIER = 100;
