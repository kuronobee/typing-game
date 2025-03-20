// src/components/PlayerAvatar.tsx
import React from 'react';

interface PlayerAvatarProps {
  hp: number;
  maxHP: number;
  className?: string;
}

const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ hp, maxHP, className = '' }) => {
  // HPの割合に基づいて状態判定
  const healthPercentage = hp / maxHP;
  
  // HPに応じて色を変化
  const bodyColor = healthPercentage <= 0.3 
    ? '#dd6666' 
    : healthPercentage <= 0.7 
      ? '#6688cc' 
      : '#4477aa';
  
  const skinColor = healthPercentage <= 0.3 
    ? '#ffaaaa' 
    : '#ffddbb';
  
  // HPに応じて表情を変化
  const mouthPath = healthPercentage <= 0.3 
    ? "M40,45 Q50,35 60,45" // 悲しい表情
    : healthPercentage <= 0.7 
      ? "M40,45 Q50,45 60,45" // 真顔
      : "M40,42 Q50,50 60,42"; // 笑顔

  return (
    <svg 
      width="100" 
      height="150" 
      viewBox="0 0 100 150" 
      className={`player-avatar ${className}`}
    >
      {/* 体 */}
      <rect 
        x="35" y="50" 
        width="30" height="60" 
        fill={bodyColor} 
        rx="5"
      />
      
      {/* 頭 */}
      <circle 
        cx="50" cy="35" 
        r="20" 
        fill={skinColor} 
      />
      
      {/* 目 */}
      <circle cx="42" cy="30" r="3" fill="#333333" />
      <circle cx="58" cy="30" r="3" fill="#333333" />
      
      {/* 口 */}
      <path 
        d={mouthPath} 
        stroke="#333333" 
        strokeWidth="2" 
        fill="none" 
      />
      
      {/* 腕 */}
      <rect x="20" y="55" width="15" height="8" fill={bodyColor} rx="4" />
      <rect x="65" y="55" width="15" height="8" fill={bodyColor} rx="4" />
      
      {/* 足 */}
      <rect x="35" y="110" width="10" height="20" fill="#333333" />
      <rect x="55" y="110" width="10" height="20" fill="#333333" />
      
      {/* 武器 (オプション) */}
      {healthPercentage > 0.5 && (
        <g transform="translate(80, 65) rotate(45)">
          <rect x="0" y="0" width="4" height="20" fill="#8B4513" />
          <polygon points="0,0 12,-5 12,5" fill="#C0C0C0" />
        </g>
      )}

      {/* 盾 (オプション) */}
      {healthPercentage > 0.7 && (
        <path 
          d="M15,65 Q10,55 15,45 L25,45 Q28,55 25,65 Z" 
          fill="#C0C0C0" 
          stroke="#555555"
        />
      )}
    </svg>
  );
};

export default PlayerAvatar;