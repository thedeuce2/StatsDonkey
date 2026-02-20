'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Team {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
  number: string;
}

function NewGameContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTeamId = searchParams.get('team'); // Pre-selected team from quick action
  
  const [step, setStep] = useState(1); // 1: Select teams, 2: Set lineups, 3: Start game
  const [homeTeam, setHomeTeam] = useState<string>('');
  const [awayTeam, setAwayTeam] = useState<string>('');
  const [homePlayers, setHomePlayers] = useState<Player[]>([]);
  const [awayPlayers, setAwayPlayers] = useState<Player[]>([]);
  const [homeLineup, setHomeLineup] = useState<Player[]>([]);
  const [awayLineup, setAwayLineup] = useState<Player[]>([]);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch teams when component mounts
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const teams: Team[] = [
          { id: '1', name: 'My Team' },
          { id: '2', name: 'The Crushers' },
          { id: '3', name: 'Thunder Chickens' },
          { id: '4', name: 'Fireballs' },
          { id: '5', name: 'Opponent Kings' },
        ];
        setAllTeams(teams);
        
        if (preselectedTeamId) {
          setHomeTeam(preselectedTeamId);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [preselectedTeamId]);

  // Fetch players when teams are selected
  useEffect(() => {
    if (homeTeam) {
      const fetchHomePlayers = async () => {
        try {
          const players: Player[] = [
            { id: 'p1', name: 'Doug Miller', number: '22' },
            { id: 'p2', name: 'Jeff Smith', number: '15' },
            { id: 'p3', name: 'Sarah Thompson', number: '08' },
            { id: 'p4', name: 'Mike Garcia', number: '33' },
            { id: 'p5', name: 'Kelly Wilson', number: '10' },
            { id: 'p6', name: 'Tom Anderson', number: '12' },
            { id: 'p7', name: 'Jane Doe', number: '05' },
            { id: 'p8', name: 'Bob Johnson', number: '18' },
            { id: 'p9', name: 'Chris Lee', number: '25' },
            { id: 'p10', name: 'Amy Chen', number: '03' },
          ];
          setHomePlayers(players);
          setHomeLineup([...players.slice(0, 10)]);
        } catch (error) {
          console.error('Error fetching home team players:', error);
        }
      };
      
      fetchHomePlayers();
    }
  }, [homeTeam]);

  useEffect(() => {
    if (awayTeam) {
      const fetchAwayPlayers = async () => {
        try {
          const players: Player[] = [
            { id: 'p11', name: 'Opponent 1', number: '01' },
            { id: 'p12', name: 'Opponent 2', number: '02' },
            { id: 'p13', name: 'Opponent 3', number: '03' },
            { id: 'p14', name: 'Opponent 4', number: '04' },
            { id: 'p15', name: 'Opponent 5', number: '05' },
            { id: 'p16', name: 'Opponent 6', number: '06' },
            { id: 'p17', name: 'Opponent 7', number: '07' },
            { id: 'p18', name: 'Opponent 8', number: '08' },
            { id: 'p19', name: 'Opponent 9', number: '09' },
            { id: 'p20', name: 'Opponent 10', number: '10' },
          ];
          setAwayPlayers(players);
          setAwayLineup([...players.slice(0, 10)]);
        } catch (error) {
          console.error('Error fetching away team players:', error);
        }
      };
      
      fetchAwayPlayers();
    }
  }, [awayTeam]);

  const handleStartGame = async () => {
    try {
      router.push(`/game?homeTeam=${homeTeam}&awayTeam=${awayTeam}`);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p>Loading game setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black italic">New Game Setup</h1>
            <div className="flex items-center gap-4 mt-1">
              <span className={`text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase ${step === 1 ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-neutral-800 text-neutral-400'}`}>
                1. Teams
              </span>
              <span className={`text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase ${step === 2 ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-neutral-800 text-neutral-400'}`}>
                2. Lineups
              </span>
              <span className={`text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase ${step === 3 ? 'bg-blue-600 text-white shadow-[0_0_10px_rgba(37,99,235,0.4)]' : 'bg-neutral-800 text-neutral-400'}`}>
                3. Play
              </span>
            </div>
          </div>
          <Link 
            href="/dashboard" 
            className="px-4 py-2 text-sm font-bold text-neutral-400 hover:text-white transition-colors uppercase tracking-widest"
          >
            Cancel
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {step === 1 && (
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-2xl">
            <h2 className="text-3xl font-black mb-8 text-center italic uppercase tracking-tighter">Select Opponents</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xs font-black mb-4 text-blue-500 uppercase tracking-widest ml-1 italic">Home Team</h3>
                <select
                  value={homeTeam}
                  onChange={(e) => setHomeTeam(e.target.value)}
                  className="w-full px-5 py-4 bg-neutral-800 border border-neutral-700 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold transition-all"
                >
                  <option value="">Select Home Team</option>
                  {allTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <h3 className="text-xs font-black mb-4 text-slate-500 uppercase tracking-widest ml-1 italic">Away Team</h3>
                <select
                  value={awayTeam}
                  onChange={(e) => setAwayTeam(e.target.value)}
                  className="w-full px-5 py-4 bg-neutral-800 border border-neutral-700 rounded-2xl text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold transition-all"
                >
                  <option value="">Select Away Team</option>
                  {allTeams.filter(t => t.id !== homeTeam).map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-12 flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!homeTeam || !awayTeam}
                className={`px-10 py-5 font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 ${
                  homeTeam && awayTeam 
                    ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500' 
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed opacity-50'
                }`}
              >
                Set Lineups
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-black text-blue-500 italic uppercase tracking-tighter">Lineup Management</h2>
                <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Argos Scorer</span>
              </div>
              
              <div className="space-y-4">
                {homePlayers.map((player) => (
                  <div 
                    key={player.id} 
                    className={`p-4 rounded-2xl border transition-all ${
                      homeLineup.some(lp => lp.id === player.id)
                        ? 'border-blue-500 bg-blue-500/10 shadow-lg'
                        : 'border-neutral-700 bg-neutral-800/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-neutral-700 flex items-center justify-center text-xs font-black">
                          {player.number || '--'}
                        </div>
                        <div>
                          <p className="font-bold">{player.name}</p>
                          <p className="text-[10px] text-neutral-500 font-mono uppercase tracking-widest italic">R-Handed • Infielder</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (homeLineup.some(lp => lp.id === player.id)) {
                            setHomeLineup(homeLineup.filter(lp => lp.id !== player.id));
                          } else {
                            setHomeLineup([...homeLineup, player]);
                          }
                        }}
                        className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                          homeLineup.some(lp => lp.id === player.id)
                            ? 'bg-blue-600 text-white'
                            : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700'
                        }`}
                      >
                        {homeLineup.some(lp => lp.id === player.id) ? 'Starter' : 'Bench'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="px-8 py-5 font-black uppercase tracking-widest rounded-2xl bg-neutral-800 text-neutral-400 hover:text-white transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-10 py-5 font-black uppercase tracking-widest rounded-2xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:bg-blue-500 ml-auto transition-all active:scale-95"
              >
                Finalize Game
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-neutral-900 rounded-3xl border border-neutral-800 p-10 shadow-2xl text-center">
            <h2 className="text-4xl font-black mb-2 italic uppercase tracking-tighter">Play Ball</h2>
            <p className="text-neutral-500 text-sm font-bold uppercase tracking-[0.2em] mb-12 italic">Argos Performance Tracking Engaged</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <div className="bg-blue-600/5 rounded-2xl p-8 border border-blue-500/20">
                <h3 className="text-[10px] font-black text-blue-500 mb-2 uppercase tracking-widest italic">Home</h3>
                <p className="font-black text-2xl uppercase tracking-tighter">{allTeams.find(t => t.id === homeTeam)?.name}</p>
                <p className="text-xs text-neutral-600 mt-2 font-mono uppercase">{homeLineup.length} Active Starters</p>
              </div>
              
              <div className="bg-neutral-800/20 rounded-2xl p-8 border border-neutral-700">
                <h3 className="text-[10px] font-black text-neutral-500 mb-2 uppercase tracking-widest italic">Away</h3>
                <p className="font-black text-2xl uppercase tracking-tighter">{allTeams.find(t => t.id === awayTeam)?.name}</p>
                <p className="text-xs text-neutral-600 mt-2 font-mono uppercase">{awayLineup.length} Active Starters</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 px-8 py-5 font-black uppercase tracking-widest rounded-2xl bg-neutral-800 text-neutral-400 hover:text-white transition-all"
              >
                Review Lineup
              </button>
              <button
                onClick={handleStartGame}
                className="flex-1 px-10 py-5 font-black uppercase tracking-widest rounded-2xl bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:bg-blue-500 transition-all active:scale-95 border border-blue-400/20"
              >
                Launch Scoreboard
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function NewGamePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black text-white p-20 text-center font-black italic uppercase animate-pulse">Initializing Sim Engine...</div>}>
      <NewGameContent />
    </Suspense>
  );
}
