'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Player {
  id: string;
  name: string;
  number: string;
  handedness: string;
}

interface Team {
  id: string;
  name: string;
  color?: string;
  isUserTeam: boolean;
}

export default function TeamPage() {
  const { id } = useParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch(`/api/teams/${id}`);
        if (!res.ok) {
          router.push('/dashboard');
          return;
        }
        const teamData = await res.json();
        setTeam(teamData);
        
        const playersRes = await fetch(`/api/teams/${id}/players`);
        if (playersRes.ok) {
          const playersData = await playersRes.json();
          setPlayers(playersData);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTeam();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mb-4"></div>
          <p>Loading team...</p>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <p>Team not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-black">{team.name}</h1>
            <p className="text-sm text-neutral-500">Team ID: {team.id}</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
              <h2 className="text-lg font-black mb-4">Team Details</h2>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-neutral-500">Team Name</p>
                  <p className="font-bold">{team.name}</p>
                </div>
                
                <div>
                  <p className="text-sm text-neutral-500">Team Type</p>
                  <p className="font-bold">{team.isUserTeam ? 'Your Team' : 'Opponent Team'}</p>
                </div>
                
                {team.color && (
                  <div>
                    <p className="text-sm text-neutral-500">Team Color</p>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-6 h-6 rounded-full border border-neutral-700" 
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <p className="font-bold">{team.color}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 pt-6 border-t border-neutral-800">
                <h3 className="font-black mb-3">Quick Actions</h3>
                <div className="space-y-2">
                  <Link 
                    href={`/games/new?team=${team.id}`}
                    className="block w-full py-2.5 text-center bg-emerald-500 text-black font-black rounded-xl hover:bg-emerald-400 transition-colors"
                  >
                    Use in New Game
                  </Link>
                  
                  {!team.isUserTeam && (
                    <button className="w-full py-2.5 text-center bg-neutral-800 text-white font-black rounded-xl border border-neutral-700 hover:bg-neutral-700 transition-colors">
                      Save as Your Team
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Players Roster */}
          <div className="lg:col-span-2">
            <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black">Player Roster</h2>
                <button className="px-3 py-1.5 bg-neutral-800 text-white text-xs font-black rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700">
                  Add Player
                </button>
              </div>
              
              {players.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No players on this team yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left py-3 px-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Number</th>
                        <th className="text-left py-3 px-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Name</th>
                        <th className="text-left py-3 px-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Handedness</th>
                        <th className="text-right py-3 px-4 text-xs font-black text-neutral-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map(player => (
                        <tr key={player.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                          <td className="py-3 px-4 font-bold">{player.number || '--'}</td>
                          <td className="py-3 px-4">{player.name}</td>
                          <td className="py-3 px-4 capitalize">{player.handedness}</td>
                          <td className="py-3 px-4 text-right">
                            <button className="text-xs font-black text-neutral-500 hover:text-white">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}