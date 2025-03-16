// src/utils/questionTextParser.tsx
import React from 'react';
import PartOfSpeechIcon from '../components/PartOfSpeechIcon';

/**
 * 問題文内の品詞タグ [名], [動], [形], [副] などをアイコンに変換する
 * @param text 解析する問題文
 * @returns JSX要素の配列
 */
export const parseQuestionText = (text: string): React.ReactNode[] => {
  if (!text) return [];

  // 品詞タグのパターン: [名], [動], [形], [副] など
  const pattern = /\[(名|動|形|副|前|接|助|冠|代|感)\]/g;
  
  // 結果のJSX要素配列
  const result: React.ReactNode[] = [];
  
  // 最後にマッチした位置
  let lastIndex = 0;
  
  // パターンにマッチする部分をアイコンに置き換える
  let match;
  while ((match = pattern.exec(text)) !== null) {
    // マッチ前のテキストを追加
    const beforeText = text.substring(lastIndex, match.index);
    if (beforeText) {
      result.push(<span key={`text-${lastIndex}`}>{beforeText}</span>);
    }
    
    // 品詞アイコンを追加
    result.push(
      <PartOfSpeechIcon 
        key={`icon-${match.index}`} 
        type={match[1] as any} 
      />
    );
    
    // 次の検索開始位置を更新
    lastIndex = match.index + match[0].length;
  }
  
  // 残りのテキストを追加
  const remainingText = text.substring(lastIndex);
  if (remainingText) {
    result.push(<span key={`text-end`}>{remainingText}</span>);
  }
  
  return result;
};