import React, { useState, useEffect, useRef } from "react";
import { MESSAGE_DISPLAY_DURATION } from "../data/constants";

export type MessageType = {
  text: string;
  sender: "enemy" | "player" | "system";
};

interface MessageDisplayProps {
  newMessage: MessageType | null;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ newMessage }) => {
  const [message, setMessage] = useState<MessageType | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (newMessage) {
      setMessage(newMessage);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setMessage(null);
      }, MESSAGE_DISPLAY_DURATION);
    }
  }, [newMessage]);

  return (
    <div
      className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 z-20 
        bg-black/50 border-white border-2 text-white px-4 py-2 rounded
        w-[90vw]
        transition-all duration-500 ease-in-out ${
          message ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
        }`}
    >
      {message && (
        <p
          className={
            message.sender === "enemy"
              ? "text-red-200 break-words"
              : message.sender === "player"
              ? "text-blue-200 break-words"
              : "text-white break-words"
          }
          style={{ whiteSpace: "normal", textAlign: "center" }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
  };

export default MessageDisplay;
