import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Visual Viewport API を使用して画面のサイズを管理
// これは近代的なブラウザ向けの解決策です
if (window.visualViewport) {
  const viewportHandler = () => {
    const visualViewport = window.visualViewport;
    if (!visualViewport) return;
    // キーボードが表示されると visual viewport の高さが変わる
    document.documentElement.style.setProperty('--window-height', `${visualViewport.height}px`);
    
    // スクロール量を計算して相殺
    const scrollY = visualViewport.offsetTop;
    if (scrollY > 0) {
      document.body.style.transform = `translateY(${-scrollY}px)`;
    } else {
      document.body.style.transform = '';
    }
  };

  const vv = window.visualViewport;
  if(vv) {
    vv.addEventListener('resize', viewportHandler);
    vv.addEventListener('scroll', viewportHandler);
  }
  // 初期化時に一度実行
  viewportHandler();
}

// iOS向けのフォーカス問題修正
// document.addEventListener('touchstart', function(e) {
//   // キーボードが表示されているとき、入力フィールド以外のタッチでブラーさせる
//   if (document.activeElement && 
//       document.activeElement.tagName === 'INPUT' && 
//       e.target !== document.activeElement) {
//     // @ts-ignore
//     document.activeElement.blur();
//   }
// }, { passive: true });