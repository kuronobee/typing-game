// src/hooks/useIOSScrollPrevention.ts
import { useEffect, RefObject } from 'react';

/**
 * iOS端末でのスクロール問題を解決するカスタムフック
 * キーボード表示時にスクロールが発生しないようにする
 * @param inputRef 入力欄の参照
 */
const useIOSScrollPrevention = (inputRef: RefObject<HTMLInputElement | null>) => {
  useEffect(() => {
    // モバイルデバイスのみに適用
    if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return;

    const scrollPos = window.scrollY;
    
    const handleScroll = () => window.scrollTo(0, scrollPos);
    
    const handleFocus = () => {
      document.body.classList.add("keyboard-open");
      window.addEventListener("scroll", handleScroll);
      
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);
    };
    
    const handleBlur = () => {
      document.body.classList.remove("keyboard-open");
      window.removeEventListener("scroll", handleScroll);
    };
    
    if (inputRef.current) {
      inputRef.current.addEventListener("focus", handleFocus);
      inputRef.current.addEventListener("blur", handleBlur);
    }
    
    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener("focus", handleFocus);
        inputRef.current.removeEventListener("blur", handleBlur);
      }
      window.removeEventListener("scroll", handleScroll);
    };
  }, [inputRef.current]);
};

export default useIOSScrollPrevention;