// src/components/FireSkillEffect.tsx の修正
import React, { useEffect, useState, useMemo } from 'react';

interface FireSkillEffectProps {
  skillName: string;
  targetPosition: { x: number, y: number };
  damageValue?: number;
  onComplete: () => void; // コールバック関数を必須にする
  duration?: number;
  power?: 'low' | 'medium' | 'high'; // スキルの威力に応じてエフェクトを変更
}

// 火の玉パーティクルの型定義
interface FireParticle {
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

const FireSkillEffect: React.FC<FireSkillEffectProps> = ({
  skillName,
  targetPosition,
  onComplete,
  duration = 1500,
  power = 'medium'
}) => {
  void skillName;
  
  const [animationStage, setAnimationStage] = useState<'charging' | 'firing' | 'impact' | 'completed'>('charging');
  
  // パワーに応じてパラメータを調整
  const powerSettings = useMemo(() => {
    switch (power) {
      case 'low':
        return {
          particleCount: 15,
          size: 100,
          colors: ['#ff4d00', '#ff7700', '#ff9500'],
          impactScale: 1.2,
          chargeDuration: 300
        };
      case 'high':
        return {
          particleCount: 40,
          size: 180,
          colors: ['#ff0000', '#ff4d00', '#ff9500', '#ffcc00'],
          impactScale: 2,
          chargeDuration: 500
        };
      case 'medium':
      default:
        return {
          particleCount: 25,
          size: 140,
          colors: ['#ff2d00', '#ff6d00', '#ff9d00'],
          impactScale: 1.5,
          chargeDuration: 400
        };
    }
  }, [power]);
  
  // 火の玉パーティクルを生成
  const fireParticles = useMemo(() => {
    const particles: FireParticle[] = [];
    
    for (let i = 0; i < powerSettings.particleCount; i++) {
      const colorIndex = Math.floor(Math.random() * powerSettings.colors.length);
      
      particles.push({
        id: i,
        x: Math.random() * 160 - 80, // -80 ~ 80の範囲
        y: Math.random() * 160 - 80,
        size: Math.random() * 10 + 5,
        speed: Math.random() * 3 + 1,
        angle: Math.random() * Math.PI * 2,
        color: powerSettings.colors[colorIndex],
        opacity: Math.random() * 0.3 + 0.7,
        delay: Math.random() * 300
      });
    }
    
    return particles;
  }, [powerSettings]);

  // アニメーションのタイミング制御
  useEffect(() => {
    // チャージアニメーション
    const chargingTimer = setTimeout(() => {
      setAnimationStage('firing');
    }, powerSettings.chargeDuration);
    
    // 発射アニメーション
    const firingTimer = setTimeout(() => {
      setAnimationStage('impact');
    }, powerSettings.chargeDuration + 400);
    
    // インパクトアニメーション
    const impactTimer = setTimeout(() => {
      setAnimationStage('completed');
    }, powerSettings.chargeDuration + 400 + 700);
    
    // エフェクト終了 - ここでコールバックを実行する
    const completionTimer = setTimeout(() => {
      // アニメーション終了時にonCompleteコールバックを実行
      onComplete();
    }, duration);
    
    return () => {
      clearTimeout(chargingTimer);
      clearTimeout(firingTimer);
      clearTimeout(impactTimer);
      clearTimeout(completionTimer);
    };
  }, [powerSettings.chargeDuration, duration, onComplete]);

  // スキル発動源の位置（画面中央下部）
  const sourcePosition = {
    x: window.innerWidth / 2,
    y: window.innerHeight * 0.5
  };
  
  // // チャージエフェクト
  // const renderChargingEffect = () => {
  //   if (animationStage !== 'charging') return null;
    
  //   return (
  //     <div 
  //       className="absolute w-16 h-16 rounded-full"
  //       style={{
  //         left: sourcePosition.x - 32,
  //         top: sourcePosition.y - 32,
  //         background: `radial-gradient(circle, ${powerSettings.colors[1]}, ${powerSettings.colors[0]})`,
  //         boxShadow: `0 0 20px ${powerSettings.colors[0]}`,
  //         animation: 'pulseGrow 0.5s ease-in-out infinite alternate',
  //         zIndex: 100
  //       }}
  //     />
  //   );
  // };

  // 発射エフェクト
  const renderFiringEffect = () => {
    if (animationStage !== 'firing') return null;
    
    // 発射元から目標までの角度を計算
    const angle = Math.atan2(
      targetPosition.y - sourcePosition.y,
      targetPosition.x - sourcePosition.x
    );
    
    // 軌道に沿って複数の火の玉を配置
    return (
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(5)].map((_, i) => {
          // 発射元から目標までの距離を5分割して配置
          const progress = i / 4;
          const x = sourcePosition.x + (targetPosition.x - sourcePosition.x) * progress;
          const y = sourcePosition.y + (targetPosition.y - sourcePosition.y) * progress;
          
          // 軌道上に火の玉を描画
          return (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                left: x - 16 * (1 + progress),
                top: y - 16 * (1 + progress),
                width: 32 * (1 + progress),
                height: 32 * (1 + progress),
                background: `radial-gradient(circle, ${powerSettings.colors[1]}, ${powerSettings.colors[0]})`,
                boxShadow: `0 0 ${10 * (1 + progress)}px ${powerSettings.colors[0]}`,
                opacity: 1 - 0.15 * i,
                transform: `rotate(${angle}rad)`,
                zIndex: 100 - i
              }}
            />
          );
        })}
        
        {/* 軌道の尾（トレイル） */}
        <div
          className="absolute"
          style={{
            left: sourcePosition.x,
            top: sourcePosition.y,
            width: Math.sqrt(
              Math.pow(targetPosition.x - sourcePosition.x, 2) + 
              Math.pow(targetPosition.y - sourcePosition.y, 2)
            ),
            height: '4px',
            background: `linear-gradient(90deg, ${powerSettings.colors[0]}, transparent)`,
            transformOrigin: '0 0',
            transform: `rotate(${angle}rad)`,
            opacity: 0.6,
            zIndex: 90
          }}
        />
      </div>
    );
  };
  
  // インパクトエフェクト
  const renderImpactEffect = () => {
    if (animationStage !== 'impact') return null;
    
    return (
      <div className="absolute" style={{
        left: targetPosition.x,
        top: targetPosition.y,
        transform: 'translate(-50%, -50%)',
      }}>
        {/* 爆発の中心 */}
        <div 
          className="absolute rounded-full"
          style={{
            width: powerSettings.size,
            height: powerSettings.size,
            left: -powerSettings.size / 2,
            top: -powerSettings.size / 2,
            background: `radial-gradient(circle, ${powerSettings.colors[1]}, ${powerSettings.colors[0]})`,
            boxShadow: `0 0 30px ${powerSettings.colors[0]}`,
            animation: 'explode 0.7s forwards'
          }}
        />
        
        {/* 波紋効果 */}
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: powerSettings.size,
              height: powerSettings.size,
              left: -powerSettings.size / 2,
              top: -powerSettings.size / 2,
              border: `2px solid ${powerSettings.colors[i % powerSettings.colors.length]}`,
              animation: `ripple 0.7s ${i * 0.15}s forwards`,
            }}
          />
        ))}
        
        {/* 火花エフェクト */}
        {fireParticles.map(particle => (
          <div
            key={particle.id}
            className="absolute rounded-full"
            style={{
              width: particle.size,
              height: particle.size,
              backgroundColor: particle.color,
              opacity: particle.opacity,
              left: particle.x,
              top: particle.y,
              transform: `rotate(${particle.angle}rad)`,
              animation: `particleMove 0.7s ease-out forwards`
            }}
          />
        ))}
        
        {/* ダメージ表示
        {damageValue && (
          <div
            className="absolute text-3xl font-bold text-center"
            style={{
              top: -60,
              width: 100,
              left: -50,
              color: powerSettings.colors[0],
              textShadow: `0 0 5px ${powerSettings.colors[1]}`,
              animation: 'damageFloat 1s forwards'
            }}
          >
            {damageValue}
          </div>
        )} */}
        
        {/* スキル名表示 
        <div
          className="absolute whitespace-nowrap"
          style={{
            bottom: powerSettings.size / 2 + 10,
            left: '50%',
            transform: 'translateX(-50%)',
            color: powerSettings.colors[1],
            textShadow: `0 0 5px ${powerSettings.colors[0]}`,
            fontWeight: 'bold',
            fontSize: '1.2rem',
            animation: 'fadeIn 0.3s forwards'
          }}
        >
          {skillName}
        </div>*/}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/*{renderChargingEffect()}*/}
      {renderFiringEffect()}
      {renderImpactEffect()}
    </div>
  );
};

export default FireSkillEffect;