// src/components/DamageDisplayComponent.tsx
import React, { useEffect, useState } from 'react';
import {Enemy as EnemyModel} from '../models/EnemyModel';
interface Props {
  damage: number;
  duration?: number;
  isCritical?: boolean;
  enemy: EnemyModel;
}

const DamageDisplayComponent: React.FC<Props> = ({
  damage,
  duration = 1500,
  isCritical = false,
  enemy,
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
        isCritical ? "text-red-500" : "text-yellow-400"
      } animate-damage-popup pointer-events-none`}
      style={{
        bottom: `${enemy?.positionOffset?.y}px`,
        left: `calc(50% + ${enemy?.positionOffset?.x}px)`,
        transform: "translateX(-50%)",
        zIndex: 50,
      }}
    >
      {damage}
    </div>
  );
};

export default DamageDisplayComponent;
