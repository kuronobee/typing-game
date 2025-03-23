// src/components/SkillCallOut.tsx
import React, { useEffect, useState } from 'react';

interface SkillCallOutProps {
  skillName: string;
  duration?: number;
}

const SkillCallOut: React.FC<SkillCallOutProps> = ({ 
  skillName, 
  duration = 1500 
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
    <div className="absolute z-50 pointer-events-none skill-callout">
      <div className="text-center animate-skill-callout">
        <span className="text-yellow-300 font-bold text-xl">
          「{skillName}」
        </span>
      </div>
    </div>
  );
};

export default SkillCallOut;