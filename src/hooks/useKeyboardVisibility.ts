// src/hooks/useKeyboardVisibility.ts
import { useState, useEffect, useRef, RefObject } from 'react';

/**
 * キーボード表示状態を検出・管理するカスタムフック
 * @param inputRef 入力欄の参照
 * @returns キーボードが表示されているかどうかの状態
 */
const useKeyboardVisibility = (inputRef: RefObject<HTMLInputElement | null>) => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const lastViewportHeight = useRef(window.innerHeight);

  // ビューポートの高さ変化に基づいてキーボード表示を検出
  useEffect(() => {
    const detectKeyboard = () => {
      if (window.innerHeight < lastViewportHeight.current * 0.8) {
        setIsKeyboardVisible(true);
      }
      lastViewportHeight.current = window.innerHeight;
    };

    window.addEventListener("resize", detectKeyboard);
    return () => window.removeEventListener("resize", detectKeyboard);
  }, []);

  // フォーカスイベントの処理
  useEffect(() => {
    const handleFocus = () => setIsKeyboardVisible(true);

    if (inputRef.current) {
      inputRef.current.addEventListener("focus", handleFocus);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("focus", handleFocus);
      }
    };
  }, [inputRef.current]);

  // キーボードが表示されているときにCSSクラスを適用
  useEffect(() => {
    if (isKeyboardVisible) {
      document.body.classList.add("keyboard-open");
      document.body.style.overflow = "hidden";
    } else {
      document.body.classList.remove("keyboard-open");
      document.body.style.overflow = "";
    }
  }, [isKeyboardVisible]);

  return isKeyboardVisible;
};

export default useKeyboardVisibility;