// src/components/PartOfSpeechIcon.tsx
import React from 'react';

type PartOfSpeechType = '名' | '動' | '形' | '副' | '前' | '接' | '助' | '冠' | '代' | '感';

interface PartOfSpeechIconProps {
  type: PartOfSpeechType;
}

/**
 * 品詞アイコンを表示するコンポーネント
 */
const PartOfSpeechIcon: React.FC<PartOfSpeechIconProps> = ({ type }) => {
  // 品詞タイプに基づいて色とスタイルを決定
  const getStyle = (type: PartOfSpeechType): { bgColor: string; textColor: string } => {
    switch (type) {
      case '名':
        return { bgColor: 'bg-blue-500', textColor: 'text-white' }; // 青: 名詞
      case '動':
        return { bgColor: 'bg-red-500', textColor: 'text-white' };  // 赤: 動詞
      case '形':
        return { bgColor: 'bg-green-500', textColor: 'text-white' }; // 緑: 形容詞
      case '副':
        return { bgColor: 'bg-yellow-500', textColor: 'text-black' }; // 黄: 副詞
      case '前':
        return { bgColor: 'bg-purple-500', textColor: 'text-white' }; // 紫: 前置詞
      case '接':
        return { bgColor: 'bg-orange-500', textColor: 'text-white' }; // オレンジ: 接続詞
      case '助':
        return { bgColor: 'bg-gray-500', textColor: 'text-white' }; // グレー: 助動詞
      case '冠':
        return { bgColor: 'bg-indigo-500', textColor: 'text-white' }; // インディゴ: 冠詞
      case '代':
        return { bgColor: 'bg-pink-500', textColor: 'text-white' }; // ピンク: 代名詞
      case '感':
        return { bgColor: 'bg-teal-500', textColor: 'text-white' }; // ティール: 感嘆詞
      default:
        return { bgColor: 'bg-gray-300', textColor: 'text-gray-800' }; // デフォルト
    }
  };

  const { bgColor, textColor } = getStyle(type);

  return (
    <span className={`inline-flex items-center justify-center h-5 w-5 ${bgColor} ${textColor} text-xs font-bold mx-1`}>
      {type}
    </span>
  );
};

export default PartOfSpeechIcon;