// src/components/MessageDisplay.tsx - 位置調整機能追加
import React, { useState, useEffect, useRef } from "react";
import { MESSAGE_DISPLAY_DURATION } from "../data/constants";

export type MessageType = {
  text: string;
  sender: "enemy" | "player" | "system";
};

interface MessageDisplayProps {
  newMessage: MessageType | null;
  isCompact?: boolean;
  position?: string; // 位置を指定する新しいプロパティ（例: "bottom-6", "bottom-20"）
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ 
  newMessage,
  isCompact = false,
  position = "bottom-20", // デフォルト位置
}) => {
  const [message, setMessage] = useState<MessageType | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (newMessage) {
      setMessage(newMessage);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setMessage(null);
      }, MESSAGE_DISPLAY_DURATION);
    }
  }, [newMessage]);

  // クリーンアップ関数でタイマーをクリア
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // コンパクトモード用のスタイル
  const containerClasses = `
    absolute z-20 ${position}
    bg-black/50 border-white border-2 text-white
    ${isCompact ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-base'}
    rounded w-[95vw]
    left-1/2 transform -translate-x-1/2
    transition-all duration-500 ease-in-out
    ${message ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"}
  `;

  const textStyle = (sender: string) => {
    let baseStyle = "break-words";
    if (isCompact) baseStyle += " text-xs";
    
    if (sender === "enemy") {
      return `${baseStyle} text-red-200`;
    } else if (sender === "player") {
      return `${baseStyle} text-blue-200`;
    } else {
      return `${baseStyle} text-white`;
    }
  };

  return (
    <div className={containerClasses}>
      {message && (
        <p
          className={textStyle(message.sender)}
          style={{ whiteSpace: "normal", textAlign: "center" }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
};

export default MessageDisplay;