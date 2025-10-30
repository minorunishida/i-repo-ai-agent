'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface FloatingIrepochanProps {
  isResponding: boolean;
  className?: string;
}

export default function FloatingIrepochan({ isResponding, className = '' }: FloatingIrepochanProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // コンポーネントがマウントされた後に表示
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // ランダムな位置を生成（画面の右側）
    const updatePosition = () => {
      const x = Math.random() * 200 + 50; // 50-250px from right
      const y = Math.random() * 300 + 100; // 100-400px from top
      setPosition({ x, y });
    };

    updatePosition();
    
    // 定期的に位置を更新（より自然な動きのため）
    const interval = setInterval(updatePosition, 8000);
    
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed z-10 pointer-events-none transition-all duration-1000 ${className}`}
      style={{
        right: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(0)',
      }}
    >
      <div
        className={`relative transition-all duration-500 ${
          isResponding 
            ? 'animate-float-active' 
            : 'animate-float'
        }`}
      >
        {/* 影効果 */}
        <div 
          className="absolute inset-0 bg-honest-500/20 rounded-full blur-md"
          style={{
            transform: 'translateY(10px) scale(1.1)',
          }}
        />
        
        {/* アイレポちゃん画像 */}
        <div className="relative">
          <Image
            src="/images/img_irepochan_02.webp"
            alt="アイレポちゃん"
            width={80}
            height={80}
            className="drop-shadow-lg"
            priority
          />
          
          {/* 回答中の光る効果 */}
          {isResponding && (
            <div className="absolute inset-0 bg-honest-400/30 rounded-full animate-pulse" />
          )}
        </div>
        
        {/* 思考バブル（回答中のみ） */}
        {isResponding && (
          <div className="absolute -top-12 -left-8 bg-white dark:bg-gray-800 rounded-full px-3 py-1 shadow-lg border border-honest-200 dark:border-honest-700">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-honest-500 rounded-full animate-bounce-gentle" />
              <div className="w-2 h-2 bg-honest-500 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-honest-500 rounded-full animate-bounce-gentle" style={{ animationDelay: '0.4s' }} />
            </div>
            {/* 吹き出しの矢印 */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white dark:border-t-gray-800" />
          </div>
        )}
      </div>
    </div>
  );
}
