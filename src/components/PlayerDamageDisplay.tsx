// src/components/PlayerDamageDisplay.tsx
import React, { useEffect, useState } from 'react';

interface PlayerDamageDisplayProps {
  damage: number;
  duration?: number;
  isCritical?: boolean;
}

const PlayerDamageDisplay: React.FC<PlayerDamageDisplayProps> = ({
  damage,
  duration = 1500,
  isCritical = false,
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!visible) return null;

  return (
    <div
      className={`absolute font-bold ${
        isCritical ? "text-red-500 text-3xl" : "text-white text-2xl"
      } animate-damage-popup pointer-events-none`}
      style={{
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -120%)',
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.7)',
        zIndex: 100,
        animation: 'damageFloat 1.5s forwards'
      }}
    >
      {damage}
    </div>
  );
};

export default PlayerDamageDisplay;