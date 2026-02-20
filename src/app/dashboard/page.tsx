'use client';

import React from 'react';
import Link from 'next/link';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div>
            <p className="text-blue-500 font-mono text-xs uppercase tracking-widest mb-1">Clubhouse</p>
            <h1 className="text-5xl font-black italic tracking-tighter uppercase">Argos <span className="text-slate-500 font-normal not-italic">Slo-Pitch</span></h1>
          </div>
          <div className="flex gap-4">
            <Link href="/game" className="bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg transition-all active:scale-95">
              New Game
            </Link>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Stats Summary */}
          <div className="md:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'GAMES', val: '12' },
              { label: 'RECORD', val: '9-3' },
              { label: 'TEAM AVG', val: '.521' },
              { label: 'RUNS', val: '144' }
            ].map((s) => (
              <div key={s.label} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-500 tracking-[0.2em] mb-2">{s.label}</span>
                <span className="text-3xl font-black tabular-nums">{s.val}</span>
              </div>
            ))}

            {/* Roster / Recent Games area */}
            <div className="col-span-full bg-slate-900 border border-slate-800 rounded-3xl p-8">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black uppercase italic tracking-tighter">Active Roster</h3>
                <button className="text-xs font-bold text-blue-500 uppercase hover:underline">Edit Team</button>
              </div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((p) => (
                  <div key={p} className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center font-bold text-xs">#{p * 3}</div>
                      <div>
                        <p className="font-bold">Player Name {p}</p>
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Infielder • R-Handed</p>
                      </div>
                    </div>
                    <div className="flex gap-8 text-right pr-4">
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">AVG</p>
                        <p className="font-mono font-bold">.625</p>
                      </div>
                      <div className="hidden sm:block">
                        <p className="text-[10px] text-slate-500 font-bold uppercase">HR</p>
                        <p className="font-mono font-bold">4</p>
                      </div>
                      <button className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-colors">
                        →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Quick Stats / Spray Chart Preview */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
              <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-6">Team Spray Chart</h4>
              <div className="aspect-square bg-green-950/40 rounded-2xl border border-green-900 flex items-center justify-center relative overflow-hidden">
                {/* Visual Placeholder for field */}
                <div className="absolute w-[80%] h-[80%] border-2 border-white/10 rounded-full -bottom-1/2"></div>
                <div className="absolute w-[60%] h-[60%] border-2 border-white/10 rounded-full -bottom-1/2"></div>
                <div className="absolute w-2 h-2 bg-red-500 rounded-full blur-[1px] top-1/4 left-1/3 opacity-80"></div>
                <div className="absolute w-2 h-2 bg-red-500 rounded-full blur-[1px] top-1/2 left-1/2 opacity-60"></div>
                <div className="absolute w-2 h-2 bg-red-500 rounded-full blur-[1px] top-1/3 right-1/4 opacity-90"></div>
                <p className="text-[10px] font-black text-green-700/60 uppercase">Aggregated Data</p>
              </div>
            </div>
            
            <div className="bg-blue-600/10 border border-blue-500/20 rounded-3xl p-6">
              <p className="text-blue-500 text-xs font-black uppercase mb-2 italic">Developer Note</p>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "Comprehensive tracking active. Every hit, advancement, and velocity metric is being logged to the database."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
