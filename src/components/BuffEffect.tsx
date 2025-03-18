// src/components/BuffEffect.tsx
import React, { useEffect, useState } from 'react';

interface BuffEffectProps {
  type: 'buff' | 'debuff';
  target: 'player' | 'enemy';
  targetIndex?: number; // 敵対象の場合に使用
  stat: 'attack' | 'defense' | 'speed' | 'all';
  duration: number; // ミリ秒単位
  onComplete: () => void;
  skillName?: string;
}

const BuffEffect: React.FC<BuffEffectProps> = ({
  type,
  target,
  targetIndex,
  stat,
  duration,
  onComplete,
  skillName
}) => {
  const [visible, setVisible] = useState(true);
  
  // エフェクト表示時間のタイマー
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onComplete]);
  
  if (!visible) return null;
  
  // バフ/デバフ用のカラー設定
  const getColors = () => {
    if (type === 'buff') {
      switch (stat) {
        case 'attack': return { main: '#ef4444', secondary: '#fee2e2' };
        case 'defense': return { main: '#3b82f6', secondary: '#dbeafe' };
        case 'speed': return { main: '#22c55e', secondary: '#dcfce7' };
        case 'all': return { main: '#a855f7', secondary: '#f3e8ff' };
        default: return { main: '#3b82f6', secondary: '#dbeafe' };
      }
    } else {
      // デバフ
      switch (stat) {
        case 'attack': return { main: '#9f1239', secondary: '#fee2e2' };
        case 'defense': return { main: '#1e3a8a', secondary: '#dbeafe' };
        case 'speed': return { main: '#166534', secondary: '#dcfce7' };
        case 'all': return { main: '#581c87', secondary: '#f3e8ff' };
        default: return { main: '#1e3a8a', secondary: '#dbeafe' };
      }
    }
  };
  
  // アイコン取得
  const getIcon = () => {
    switch (stat) {
      case 'attack': return '⚔️';
      case 'defense': return '🛡️';
      case 'speed': return '⚡';
      case 'all': return '✨';
      default: return '✨';
    }
  };
  
  // 効果テキスト取得
  const getEffectText = () => {
    const prefix = type === 'buff' ? '+' : '-';
    switch (stat) {
      case 'attack': return `${prefix}攻撃力`;
      case 'defense': return `${prefix}防御力`;
      case 'speed': return `${prefix}速度`;
      case 'all': return `${prefix}全能力`;
      default: return `${prefix}能力`;
    }
  };
  
  const colors = getColors();
  const icon = getIcon();
  const effectText = getEffectText();
  
  // ターゲットに応じた位置計算
  const getPosition = () => {
    if (target === 'player') {
      return {
        left: '50%',
        bottom: '30%',
        transform: 'translateX(-50%)'
      };
    } else {
      // 敵ターゲット（ここでは簡易的な位置決め）
      return {
        left: '50%',
        top: '40%',
        transform: 'translateX(-50%)'
      };
    }
  };
  
  const position = getPosition();
  
  // 複数の波紋エフェクトを追加
  const renderRipples = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div
        key={index}
        className="absolute inset-0 rounded-full"
        style={{
          border: `2px solid ${colors.main}`,
          animation: `ripple 1.5s ease-out ${index * 0.3}s infinite`,
          backgroundColor: 'transparent'
        }}
      />
    ));
  };
  
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        ...position,
        width: '120px',
        height: '120px'
      }}
    >
      {/* スキル名 */}
      {skillName && (
        <div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full mb-2 whitespace-nowrap"
          style={{
            color: colors.main,
            fontWeight: 'bold',
            textShadow: `0 0 5px ${colors.secondary}`,
            animation: 'scaleIn 0.5s ease-out forwards'
          }}
        >
          {skillName}
        </div>
      )}
      
      {/* 中央のアイコン */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* 波紋エフェクト */}
        {renderRipples()}
        
        {/* 中央のアイコンと効果テキスト */}
        <div
          className="absolute flex flex-col items-center justify-center"
          style={{
            animation: 'scaleIn 0.5s ease-out forwards',
            zIndex: 1
          }}
        >
          <div className="text-3xl mb-1">{icon}</div>
          <div
            style={{
              color: colors.main,
              fontWeight: 'bold',
              textShadow: `0 0 5px ${colors.secondary}`
            }}
          >
            {effectText}
          </div>
        </div>
        
        {/* 上昇/下降矢印 */}
        <div className="absolute w-full h-full">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                top: type === 'buff' ? '65%' : '35%',
                left: `${12.5 * (index + 1)}%`,
                fontSize: '20px',
                color: colors.main,
                transform: 'translateX(-50%)',
                animation: `${type === 'buff' ? 'floatUp' : 'floatDown'} 1.5s ease-out ${index * 0.1}s infinite`
              }}
            >
              {type === 'buff' ? '↑' : '↓'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuffEffect;