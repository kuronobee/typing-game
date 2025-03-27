// src/managers/NotificationManager.ts - 通知の厳格な管理
import { Skill } from "../models/Skill";

// 通知タイプの定義
export type NotificationType = 
  | { type: 'levelUp'; level: number; callback: () => void }
  | { type: 'skillAcquisition'; skill: Skill; callback: () => void };

/**
 * アプリケーション全体の通知を管理するマネージャークラス
 * シングルトンパターンを使用して、通知の表示を一つずつ管理します
 */
export class NotificationManager {
  private static instance: NotificationManager;
  
  // 通知キュー
  private notificationQueue: NotificationType[] = [];
  
  // 現在表示中の通知
  private currentNotification: NotificationType | null = null;
  
  // 処理中フラグ
  private isProcessing: boolean = false;
  
  // レベルアップ表示関数の参照
  private showLevelUpFunc: ((level: number, callback: () => void) => void) | null = null;
  
  // スキル獲得表示関数の参照
  private showSkillFunc: ((skill: Skill, callback: () => void) => void) | null = null;
  
  // プライベートコンストラクタ（シングルトンのため）
  private constructor() {}
  
  /**
   * NotificationManagerのインスタンスを取得
   */
  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }
  
  /**
   * 表示関数を設定
   */
  public setDisplayFunctions(
    showLevelUp: (level: number, callback: () => void) => void,
    showSkill: (skill: Skill, callback: () => void) => void
  ): void {
    this.showLevelUpFunc = showLevelUp;
    this.showSkillFunc = showSkill;
    console.log("NotificationManager: 表示関数が設定されました");
  }
  
  /**
   * レベルアップ通知を追加
   */
  public addLevelUpNotification(level: number): void {
    if (level <= 0) {
      console.error(`NotificationManager: 不正なレベル値: ${level}`);
      return;
    }
    
    // ユーザーアクションを待つためのラッパー関数
    const notification: NotificationType = {
      type: 'levelUp',
      level,
      callback: () => {
        console.log(`NotificationManager: レベル${level}の通知処理完了`);
        this.completeCurrentNotification();
      }
    };
    
    this.addToQueue(notification);
  }
  
  /**
   * スキル獲得通知を追加
   */
  public addSkillNotification(skill: Skill): void {
    if (!skill) {
      console.error("NotificationManager: 不正なスキルオブジェクト");
      return;
    }
    
    // ユーザーアクションを待つためのラッパー関数
    const notification: NotificationType = {
      type: 'skillAcquisition',
      skill,
      callback: () => {
        console.log(`NotificationManager: スキル「${skill.name}」の通知処理完了`);
        this.completeCurrentNotification();
      }
    };
    
    this.addToQueue(notification);
  }
  
  /**
   * 通知キューに追加
   */
  private addToQueue(notification: NotificationType): void {
    this.notificationQueue.push(notification);
    console.log(`NotificationManager: 通知がキューに追加されました (タイプ: ${notification.type}, キュー長: ${this.notificationQueue.length})`);
    
    // キューが処理中でなければ、処理を開始
    if (!this.isProcessing) {
      this.processNextNotification();
    }
  }
  
  /**
   * 現在の通知を完了し、次の通知を処理
   */
  private completeCurrentNotification(): void {
    console.log("NotificationManager: 現在の通知を完了します");
    this.currentNotification = null;
    
    // 次の通知を処理
    setTimeout(() => {
      this.processNextNotification();
    }, 300); // 状態更新を待つため少し遅延
  }
  
  /**
   * 次の通知を処理
   */
  private processNextNotification(): void {
    // 既に処理中なら何もしない
    if (this.currentNotification) {
      console.log("NotificationManager: 既に通知表示中です、待機します");
      return;
    }
    
    // キューが空なら処理終了
    if (this.notificationQueue.length === 0) {
      console.log("NotificationManager: 通知キューが空です、処理を終了します");
      this.isProcessing = false;
      return;
    }
    
    // 処理中フラグをセット
    this.isProcessing = true;
    
    // キューから次の通知を取り出す
    const nextNotification = this.notificationQueue.shift();
    if (!nextNotification) {
      console.error("NotificationManager: 次の通知の取得に失敗しました");
      this.isProcessing = false;
      return;
    }
    
    // 現在の通知として設定
    this.currentNotification = nextNotification;
    
    console.log(`NotificationManager: 通知を表示します (タイプ: ${nextNotification.type})`);
    
    try {
      // 通知タイプに応じた表示
      if (nextNotification.type === 'levelUp' && this.showLevelUpFunc) {
        console.log(`NotificationManager: レベル${nextNotification.level}の通知を表示します`);
        this.showLevelUpFunc(nextNotification.level, nextNotification.callback);
      } 
      else if (nextNotification.type === 'skillAcquisition' && this.showSkillFunc) {
        console.log(`NotificationManager: スキル「${nextNotification.skill.name}」の通知を表示します`);
        this.showSkillFunc(nextNotification.skill, nextNotification.callback);
      }
      else {
        console.error("NotificationManager: 不明な通知タイプまたは表示関数が設定されていません");
        this.completeCurrentNotification(); // エラー時も次へ進む
      }
    } catch (error) {
      console.error("NotificationManager: 通知表示中にエラーが発生しました", error);
      this.completeCurrentNotification(); // エラー時も次へ進む
    }
  }
  
  /**
   * キューをクリア（緊急時用）
   */
  public clearQueue(): void {
    this.notificationQueue = [];
    this.currentNotification = null;
    this.isProcessing = false;
    console.log("NotificationManager: 通知キューをクリアしました");
  }
  
  /**
   * 通知キューの状態を取得（デバッグ用）
   */
  public getQueueStatus(): {
    queueLength: number;
    isProcessing: boolean;
    currentNotificationType: string | null;
  } {
    return {
      queueLength: this.notificationQueue.length,
      isProcessing: this.isProcessing,
      currentNotificationType: this.currentNotification?.type || null
    };
  }
}