'use client';

import React, { useState } from 'react';
import Image from 'next/image';

const Login = () => {
  const [team, setTeam] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (team === 'Argos' && password === 'Argos123') {
      window.location.href = '/dashboard';
    } else {
      setError('Invalid team name or password.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-slate-950">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
        
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
               <Image 
                src="/images/logo.jpg" 
                alt="StatsDonkey Logo" 
                fill 
                className="object-cover"
                priority
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2">Stats<span className="text-blue-500">Donkey</span></h1>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">Slo-Pitch Engine v1.0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-1">Team Name</label>
            <input 
              type="text" 
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-bold"
              placeholder="e.g. Argos"
              required
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2 ml-1">Access Code</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder:text-slate-600 font-bold"
              placeholder="••••••••"
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm font-bold text-center italic">{error}</p>}

          <button 
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
          >
            Enter Clubhouse
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-slate-600 italic">
          Doug's Sim Engine - Authorized Personnel Only
        </p>
      </div>
    </div>
  );
};

export default Login;
