'use client';

import React, { useState } from 'react';
import Diamond from '../../components/diamond';
import { AtBatResult, HitType, HitVelocity } from '../../types/game';

const GameInterface = () => {
  const [hitLocation, setHitLocation] = useState<{x: number, y: number} | null>(null);
  const [runners, setRunners] = useState<(string | null)[]>([null, null, null]);
  const [showInput, setShowInput] = useState(false);
  const [currentPlay, setCurrentPlay] = useState({
    result: 'single' as AtBatResult,
    hitType: 'line_drive' as HitType,
    velocity: 'average' as HitVelocity,
  });

  const handleFieldClick = (point: {x: number, y: number}) => {
    setHitLocation(point);
    setShowInput(true);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden landscape:flex-row">
      {/* Sidebar - Lineup & Stats */}
      <div className="w-full landscape:w-1/4 bg-slate-900 border-r border-slate-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 flex items-center">
          <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
          Argos Lineup
        </h2>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((idx) => (
            <div 
              key={idx} 
              className={`p-3 rounded-lg border transition-all ${idx === 1 ? 'bg-blue-900/40 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'bg-slate-800 border-slate-700 opacity-60'}`}
            >
              <div className="flex justify-between items-center">
                <span className="font-mono text-xs text-slate-400">{idx}.</span>
                <span className="font-bold flex-grow ml-3">Player {idx}</span>
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">.450 AVG</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content - Diamond & Scoreboard */}
      <div className="flex-grow flex flex-col p-4 space-y-4">
        {/* Scoreboard */}
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex justify-between items-center shadow-lg">
          <div className="flex space-x-8">
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest">Away</p>
              <p className="text-4xl font-black">0</p>
            </div>
            <div className="flex flex-col justify-center items-center">
              <p className="text-blue-500 font-bold text-lg">Top 1</p>
              <div className="flex space-x-1 mt-1">
                {[1, 2].map((o) => (
                  <div key={o} className="w-2.5 h-2.5 rounded-full border border-slate-600"></div>
                ))}
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold text-blue-500">Argos</p>
              <p className="text-4xl font-black text-blue-500">0</p>
            </div>
          </div>
          
          <div className="hidden md:block">
            <p className="text-xs text-right text-slate-400">LOCATION</p>
            <p className="font-medium">Centennial Park - Diamond 1</p>
          </div>
        </div>

        {/* Diamond Area */}
        <div className="flex-grow flex items-center justify-center relative">
          <Diamond 
            onHitClick={handleFieldClick} 
            hitLocation={hitLocation}
            runners={runners}
          />

          {/* Quick Input Overlay */}
          {showInput && (
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6 z-50">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                <h3 className="text-2xl font-black mb-6 text-center text-blue-400 uppercase italic tracking-tighter">Record Result</h3>
                
                <div className="space-y-6">
                  {/* Hit Type */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Hit Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['fly_ball', 'ground_ball', 'line_drive', 'pop_up'].map((t) => (
                        <button 
                          key={t}
                          onClick={() => setCurrentPlay({...currentPlay, hitType: t as HitType})}
                          className={`py-3 rounded-lg text-xs font-bold capitalize border transition-all ${currentPlay.hitType === t ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-800 border-slate-700 hover:bg-slate-750'}`}
                        >
                          {t.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Velocity */}
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold uppercase mb-2 block">Velocity</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['soft', 'average', 'hard'].map((v) => (
                        <button 
                          key={v}
                          onClick={() => setCurrentPlay({...currentPlay, velocity: v as HitVelocity})}
                          className={`py-3 rounded-lg text-xs font-bold capitalize border transition-all ${currentPlay.velocity === v ? 'bg-blue-600 border-blue-400 shadow-lg' : 'bg-slate-800 border-slate-700'}`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex space-x-3 pt-4 border-t border-slate-800">
                    <button 
                      onClick={() => setShowInput(false)}
                      className="flex-1 py-4 font-bold text-slate-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      className="flex-1 py-4 bg-blue-600 rounded-xl font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95"
                    >
                      Process Play
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameInterface;
