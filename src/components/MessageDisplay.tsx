// src/components/MessageDisplay.tsx - コンパクトモードのみ対応版
import React, { useState, useEffect, useRef } from "react";
import { MESSAGE_DISPLAY_DURATION, MESSAGE_GROUP_THRESHOLD } from "../data/constants";

export type MessageType = {
  id?: string; // メッセージを一意に識別するためのID
  text: string;
  sender: "enemy" | "player" | "system";
  timestamp?: number; // 発生時刻
};

interface MessageDisplayProps {
  newMessage: MessageType | null;
  position?: string; // 位置を指定するプロパティ
  maxMessages?: number; // 同時に表示する最大メッセージ数
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  newMessage,
  position = "bottom-6",
  maxMessages = 3 // デフォルトは3つまで表示
}) => {
  // 複数のメッセージを管理するための状態
  const [messages, setMessages] = useState<MessageType[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // メッセージが追加されたときの処理
  useEffect(() => {
    if (newMessage) {
      // タイムスタンプとIDを追加
      const messageWithTimestamp = {
        ...newMessage,
        id: newMessage.id || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: newMessage.timestamp || Date.now()
      };
      setMessages(prevMessages => {
        // 前のメッセージがあり、指定時間以内に発生した場合は追加
        const recentMessages = prevMessages.filter(msg => {
          const timeDiff = (messageWithTimestamp.timestamp || 0) - (msg.timestamp || 0);
          return timeDiff < MESSAGE_GROUP_THRESHOLD;
        });
        
        // 最大表示数を制限
        const limitedMessages = [...recentMessages, messageWithTimestamp]
          .slice(-maxMessages);
        
        return limitedMessages;
      });
      
      // 以前のタイマーがあればクリア
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      
      // 一定時間後にメッセージをクリア
      timerRef.current = setTimeout(() => {
        setMessages([]);
      }, MESSAGE_DISPLAY_DURATION);
    }
  }, [newMessage, maxMessages]);

  // クリーンアップ関数でタイマーをクリア
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 表示するメッセージがなければ何も表示しない
  if (messages.length === 0) {
    return null;
  }

  // 送信者に基づいてメッセージのスタイルクラスを取得
  const getMessageClass = (sender: string) => {
    switch (sender) {
      case "enemy":
        return "text-red-500"; // 敵のメッセージは赤色
      case "player":
        return "text-blue-400"; // プレイヤーのメッセージは青色
      case "system":
      default:
        return "text-white"; // システムメッセージは白色
    }
  };

  // 常にコンパクトモード用のスタイル
  const containerClasses = `
    absolute z-20 ${position}
    bg-black/30 border-white border-2 text-white
    px-2 py-1
    rounded w-[95vw] max-w-xl
    left-1/2 transform -translate-x-1/2
    transition-all duration-300 ease-in-out
    opacity-100 scale-100
  `;

  return (
    <div className={containerClasses}>
      {/* 複数メッセージを改行して表示 */}
      <div className="flex flex-col gap-1">
        {messages.map((message, index) => (
          <React.Fragment key={message.id}>
            {/* メッセージ間のセパレータ */}
            {index > 0 && <div className="message-separator" />}
            
            {/* メッセージ本体 - 送信者によって色を変更 */}
            <p
              className={`${getMessageClass(message.sender)} text-xs message-fade-in`}
              style={{ whiteSpace: "normal", textAlign: "left" }}
            >
              {message.text}
            </p>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default MessageDisplay;