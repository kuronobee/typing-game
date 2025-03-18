// src/components/SkillEffect.tsx
import React, { useEffect, useState, useMemo } from 'react';

interface SkillEffectProps {
  type: 'heal' | 'damage' | 'buff' | 'debuff';
  targetPosition?: { x: number, y: number };
  value?: number;
  onComplete: () => void;
  duration?: number;
  skillName?: string; // スキル名を表示するためのオプション
}

// パーティクルの型定義
interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  angle: number;
  color: string;
  opacity: number;
  delay: number;
}

const SkillEffect: React.FC<SkillEffectProps> = ({
  type,
  targetPosition,
  value,
  onComplete,
  duration = 1000,
  skillName
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // パーティクルを生成する関数
  const generateParticles = (type: string, count: number = 15): Particle[] => {
    const particles: Particle[] = [];
    
    // タイプに応じた色を設定
    let colors: string[] = [];
    switch (type) {
      case 'heal':
        colors = ['#4ade80', '#22c55e', '#16a34a'];
        break;
      case 'damage':
        colors = ['#ef4444', '#dc2626', '#f97316'];
        break;
      case 'buff':
        colors = ['#3b82f6', '#2563eb', '#60a5fa'];
        break;
      case 'debuff':
        colors = ['#a855f7', '#9333ea', '#c084fc'];
        break;
      default:
        colors = ['#ffffff', '#e5e5e5', '#d4d4d4'];
    }
    
    for (let i = 0; i < count; i++) {
      particles.push({
        id: i,
        x: Math.random() * 100 - 50, // -50 ~ 50の範囲
        y: Math.random() * 100 - 50,
        size: Math.random() * 8 + 2, // 2 ~ 10の範囲
        speed: Math.random() * 2 + 1,
        angle: Math.random() * Math.PI * 2, // 0 ~ 2πの範囲
        color: colors[Math.floor(Math.random() * colors.length)],
        opacity: Math.random() * 0.5 + 0.5, // 0.5 ~ 1.0の範囲
        delay: Math.random() * 200 // 0 ~ 200msの範囲でディレイ
      });
    }
    
    return particles;
  };
  
  // エフェクトタイプに応じたパーティクル生成
  const particles = useMemo(() => {
    const count = type === 'damage' ? 20 : type === 'heal' ? 15 : 10;
    return generateParticles(type, count);
  }, [type]);

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
          symbol: '✚',
          nameClass: 'text-green-400'
        };
      case 'damage':
        return {
          className: 'text-red-500 font-bold animate-explosion',
          text: `${value || ''}`,
          symbol: '🔥',
          nameClass: 'text-red-400'
        };
      case 'buff':
        return {
          className: 'text-blue-400 font-bold animate-pulse',
          text: 'BUFF',
          symbol: '↑',
          nameClass: 'text-blue-300'
        };
      case 'debuff':
        return {
          className: 'text-purple-500 font-bold animate-pulse',
          text: 'DEBUFF',
          symbol: '↓',
          nameClass: 'text-purple-400'
        };
      default:
        return {
          className: 'text-white font-bold',
          text: '',
          symbol: '✧',
          nameClass: 'text-white'
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
        pointerEvents: 'none'
      } as React.CSSProperties
    : {
        position: 'absolute',
        left: '50%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none'
      } as React.CSSProperties;

  return (
    <div style={positionStyle} className="pointer-events-none z-50">
      {/* パーティクルエフェクト */}
      <div className="absolute inset-0 w-full h-full">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              transform: `rotate(${particle.angle}rad)`,
              animation: `particleMove ${duration}ms ease-out forwards`,
              animationDelay: `${particle.delay}ms`
            }}
          />
        ))}
      </div>
      
      {/* スキル名表示（設定されている場合） */}
      {skillName && (
        <div className={`${effectStyle.nameClass} text-lg mb-1 font-bold text-center animate-scale-in`}>
          {skillName}
        </div>
      )}
      
      {/* メインエフェクト */}
      <div className={`text-2xl ${effectStyle.className}`}>
        <span className="mr-1">{effectStyle.symbol}</span>
        <span>{effectStyle.text}</span>
      </div>
    </div>
  );
};

export default SkillEffect;