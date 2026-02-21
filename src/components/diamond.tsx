'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Point {
  x: number;
  y: number;
}

interface DiamondProps {
  onHitClick: (point: Point) => void;
  hitLocation?: Point | null;
  runners: (string | null)[]; // [first, second, third]
}

const Diamond: React.FC<DiamondProps> = ({ onHitClick, hitLocation, runners }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    onHitClick({ x, y });
  };

  return (
    <div className="relative w-full max-w-[500px] aspect-[3/2] mx-auto bg-green-900 rounded-lg overflow-hidden shadow-2xl border-4 border-green-800 touch-none">
      <div 
        ref={containerRef}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleClick}
      >
        {/* Field Lines */}
        <svg viewBox="0 0 100 66.6" className="w-full h-full pointer-events-none">
          {/* Outfield Grass */}
          <path d="M 50 60 L 0 10 L 0 0 L 100 0 L 100 10 Z" fill="#065f46" opacity="0.3" />
          
          {/* Foul Lines */}
          <line x1="50" y1="60" x2="0" y2="10" stroke="white" strokeWidth="0.5" />
          <line x1="50" y1="60" x2="100" y2="10" stroke="white" strokeWidth="0.5" />
          
          {/* Infield Dirt (Simplified Diamond) */}
          <path 
            d="M 50 60 L 35 45 L 50 30 L 65 45 Z" 
            fill="#92400e" 
            stroke="#78350f" 
            strokeWidth="0.5"
          />
          
          {/* Bases */}
          <rect x="48.5" y="58.5" width="3" height="3" fill="white" transform="rotate(45 50 60)" /> {/* Home */}
          <rect x="63.5" y="43.5" width="3" height="3" fill={runners[0] ? "#fbbf24" : "white"} transform="rotate(45 65 45)" /> {/* 1st */}
          <rect x="48.5" y="28.5" width="3" height="3" fill={runners[1] ? "#fbbf24" : "white"} transform="rotate(45 50 30)" /> {/* 2nd */}
          <rect x="33.5" y="43.5" width="3" height="3" fill={runners[2] ? "#fbbf24" : "white"} transform="rotate(45 35 45)" /> {/* 3rd */}
          
          {/* Pitcher's Mound */}
          <circle cx="50" cy="45" r="1.5" fill="#78350f" />

          {/* Current Hit Marker */}
          {hitLocation && (
            <circle cx={hitLocation.x} cy={hitLocation.y} r="1.5" fill="#ef4444" className="animate-pulse" />
          )}
        </svg>
      </div>
      
      {/* HUD Info */}
      <div className="absolute top-2 right-2 flex space-x-2">
        <div className="bg-black/60 px-2 py-1 rounded text-xs text-white font-mono uppercase tracking-tighter">
          Landscape Mode Opt.
        </div>
      </div>
    </div>
  );
};

export default Diamond;
