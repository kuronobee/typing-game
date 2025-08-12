import React, { useEffect } from 'react';

interface BossAppearEffectProps {
  text?: string;
  duration?: number; // ms
  onComplete?: () => void;
}

const BossAppearEffect: React.FC<BossAppearEffectProps> = ({
  text = 'ボス出現！',
  duration = 1800,
  onComplete,
}) => {
  useEffect(() => {
    const t = setTimeout(() => onComplete && onComplete(), duration);
    return () => clearTimeout(t);
  }, [duration, onComplete]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 animate-fade-in" />
      <div className="relative flex items-center justify-center">
        <div className="boss-ring" />
        <div className="text-white drop-shadow-lg text-4xl md:text-6xl font-extrabold tracking-widest animate-boss-pop">
          {text}
        </div>
      </div>
    </div>
  );
};

export default BossAppearEffect;

