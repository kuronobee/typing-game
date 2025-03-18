// src/components/SkillEffect.tsx
import React, { useEffect, useState } from 'react';

interface SkillEffectProps {
  type: 'heal' | 'damage' | 'buff' | 'debuff';
  targetPosition?: { x: number, y: number };
  value?: number;
  onComplete: () => void;
  duration?: number;
}

const SkillEffect: React.FC<SkillEffectProps> = ({
  type,
  targetPosition,
  value,
  onComplete,
  duration = 1000
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // エフェクト表示後、指定された時間後に非表示にする
    const timer = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  if (!isVisible) return null;

  // エフェクトのスタイルを決定
  const getEffectStyle = () => {
    switch (type) {
      case 'heal':
        return {
          className: 'text-green-500 font-bold animate-float-up',
          text: `+${value || ''}`,
          symbol: '✚'
        };
      case 'damage':
        return {
          className: 'text-red-500 font-bold animate-explosion',
          text: `${value || ''}`,
          symbol: '🔥'
        };
      case 'buff':
        return {
          className: 'text-blue-400 font-bold animate-pulse',
          text: 'BUFF',
          symbol: '↑'
        };
      case 'debuff':
        return {
          className: 'text-purple-500 font-bold animate-pulse',
          text: 'DEBUFF',
          symbol: '↓'
        };
      default:
        return {
          className: 'text-white font-bold',
          text: '',
          symbol: '✧'
        };
    }
  };

  const effectStyle = getEffectStyle();
  
  // 位置指定がある場合は絶対配置、なければ中央に表示
  const positionStyle = targetPosition 
    ? {
        position: 'absolute',
        left: `${targetPosition.x}px`,
        top: `${targetPosition.y}px`,
        transform: 'translate(-50%, -50%)',
      } as React.CSSProperties
    : {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
      } as React.CSSProperties;

  return (
    <div style={positionStyle} className="pointer-events-none z-50">
      <div className={`text-2xl ${effectStyle.className}`}>
        <span className="mr-1">{effectStyle.symbol}</span>
        <span>{effectStyle.text}</span>
      </div>
    </div>
  );
};

export default SkillEffect;