// src/components/CombatEffects.tsx
import React from 'react';

interface CombatEffectsProps {
  isScreenHit: boolean;
  isScreenShake: boolean;
  children: React.ReactNode;
}

/**
 * 戦闘エフェクト（画面のフラッシュや揺れ）を管理するコンポーネント
 */
const CombatEffects: React.FC<CombatEffectsProps> = ({ 
  isScreenHit,
  isScreenShake,
  children 
}) => {
  return (
    <div
      className={`w-full flex flex-col ${
        isScreenHit ? "screen-flash-shake" : isScreenShake ? "screen-shake" : ""
      }`}
    >
      {children}
    </div>
  );
};

export default CombatEffects;