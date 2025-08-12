import React, { useEffect } from 'react';

interface StageClearProps {
  onReturnToTitle: () => void;
  autoReturnMs?: number;
}

const StageClear: React.FC<StageClearProps> = ({ onReturnToTitle, autoReturnMs = 3000 }) => {
  useEffect(() => {
    const t = setTimeout(() => onReturnToTitle(), autoReturnMs);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onReturnToTitle();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [onReturnToTitle, autoReturnMs]);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">
      <div className="bg-gray-900/85 text-white rounded-lg shadow-lg p-6 w-[90%] max-w-md text-center border border-white/20">
        <div className="text-2xl font-bold mb-2">ステージクリア！</div>
        <div className="text-sm text-gray-200 mb-4">おつかれさまです。タイトルに戻ります。</div>
        <button
          type="button"
          onClick={onReturnToTitle}
          className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white"
        >
          タイトルへ戻る（Enter）
        </button>
      </div>
    </div>
  );
};

export default StageClear;

