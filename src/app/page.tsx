'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="mb-12 relative">
        {/* Decorative Background Element */}
        <div className="absolute inset-0 bg-blue-500 blur-[120px] opacity-20 -z-10 animate-pulse"></div>
        
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter uppercase text-white mb-4">
          SloPitch <span className="text-blue-600">Pro</span>
        </h1>
        <p className="text-slate-400 font-mono text-sm uppercase tracking-[0.4em] ml-2">
          Elite Performance Analytics
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-6 w-full max-w-lg">
        <Link 
          href="/login" 
          className="flex-1 bg-white text-black font-black uppercase tracking-widest py-6 rounded-2xl shadow-xl hover:bg-slate-200 transition-all active:scale-95"
        >
          Enter Clubhouse
        </Link>
        <Link 
          href="/game" 
          className="flex-1 bg-blue-600 text-white font-black uppercase tracking-widest py-6 rounded-2xl shadow-[0_0_30px_rgba(37,99,235,0.4)] hover:bg-blue-500 transition-all active:scale-95 border border-blue-400/30"
        >
          Quick Score
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-4xl text-left border-t border-slate-900 pt-12">
        <div>
          <h3 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-4 italic">01. Tracking</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Detailed hit velocity, launch angle, and field placement tracking for every at-bat in your career.
          </p>
        </div>
        <div>
          <h3 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-4 italic">02. Strategy</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Automatic spray charts and situational stats that update in real-time as the game progresses.
          </p>
        </div>
        <div>
          <h3 className="text-blue-500 font-black text-xs uppercase tracking-widest mb-4 italic">03. Roster</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Manage up to 13+ players, track opponents, and handle multi-team player career stats seamlessly.
          </p>
        </div>
      </div>

      <footer className="mt-20 text-[10px] font-bold text-slate-800 uppercase tracking-widest italic">
        Doug's Sim Engine • Est. 2026
      </footer>
    </div>
  );
}
