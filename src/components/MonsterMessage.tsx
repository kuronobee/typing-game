import React, { useEffect, useState } from 'react';

interface MonsterMessageProps {
  message: string;
  monsterId?: number;
  position?: 'top' | 'center' | 'bottom';
}

const MonsterMessage: React.FC<MonsterMessageProps> = ({
  message,
  monsterId = 0,
  position = 'top',
}) => {
  const [displayMessage, setDisplayMessage] = useState<string>('');

  useEffect(() => {
    if (!message) return;
    console.log('MonsterMessage: ', message);
    setDisplayMessage(message);
  }, [message]);

  if (!displayMessage) return null;

  const positionStyle = {
    top: position === 'top' ? '-40px' : position === 'center' ? '50%' : 'auto',
    bottom: position === 'bottom' ? '-40px' : 'auto',
    transform: position === 'center' ? 'translate(-50%, -50%)' : 'translateX(-50%)',
  };

  return (
    <div
      className="monster-message absolute z-40 left-1/2 px-2 py-1 rounded-lg text-center whitespace-nowrap monster-message-animation"
      style={positionStyle}
      data-monster-id={monsterId}
    >
      <div className="relative z-10 font-bold text-white text-sm px-3 py-1">
        {displayMessage}
      </div>
    </div>
  );
};

export default MonsterMessage;
