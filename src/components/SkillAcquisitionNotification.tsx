// src/components/SkillAcquisitionNotification.tsx
import React, { useEffect, useState } from 'react';
import { Skill } from '../models/Skill';

interface SkillAcquisitionNotificationProps {
  skill: Skill;
  onClose: () => void;
  duration?: number;
}

const SkillAcquisitionNotification: React.FC<SkillAcquisitionNotificationProps> = ({
  skill,
  onClose,
  duration = 6000 // デフォルトで6秒表示
}) => {
  const [visible, setVisible] = useState(true);
  
  // 自動的に閉じる処理
  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 500); // フェードアウト後に親コンポーネントに通知
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, onClose]);
  
  return (
    <div 
      className={`fixed inset-0 flex items-center justify-center z-100 pointer-events-auto
                 transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div className="bg-gray-800 border-2 border-yellow-500 rounded-lg p-6 max-w-md mx-4 animate-skill-acquired">
        <div className="text-center">
          <h2 className="text-2xl text-yellow-300 font-bold mb-4">新しいスキルを習得！</h2>
          
          <div className="flex items-center justify-center mb-4">
            {skill.icon ? (
              <img src={skill.icon} alt={skill.name} className="w-16 h-16 mr-3" />
            ) : (
              <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mr-3">
                <span className="text-2xl text-yellow-300">{skill.name.charAt(0)}</span>
              </div>
            )}
            <h3 className="text-xl text-white font-bold">{skill.name}</h3>
          </div>
          
          <div className="bg-gray-700 rounded-lg p-4 mb-4">
            <p className="text-white">{skill.description}</p>
          </div>
          
          <div className="flex justify-between text-sm text-gray-300 mb-6">
            <div>
              <span className="font-bold text-blue-300">MP消費:</span> {skill.mpCost}
            </div>
            <div>
              <span className="font-bold text-blue-300">クールダウン:</span> {skill.cooldown}秒
            </div>
          </div>
          
          <button
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
            onClick={() => {
              setVisible(false);
              setTimeout(onClose, 500);
            }}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkillAcquisitionNotification;