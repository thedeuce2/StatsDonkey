import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { calculatePlayerStats } from '../models/statEngine';
import { ArrowLeft, BarChart2 } from 'lucide-react';

const StatsScreen = () => {
    const navigate = useNavigate();
    const { state } = useGame();

    // Aggregate all events from all passed games into a flat array
    const allEvents = state.pastGames.flatMap(game => game.events);

    // Get current roster to display their stats
    const myRoster = state.myTeam?.roster || [];

    // Map roster to their calculated stats
    const playerStats = useMemo(() => {
        return myRoster.map(player => {
            const playerEvents = allEvents.filter(e => e.batterId === player.id);
            const stats = calculatePlayerStats(playerEvents);
            return {
                player,
                stats
            };
        });
    }, [myRoster, allEvents]);

    return (
        <div className="screen-container" style={{ width: '100%', maxWidth: '800px', padding: '1rem', overflowY: 'auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="icon-btn" onClick={() => navigate('/')} style={{ marginRight: '1rem' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ flexGrow: 1, margin: 0 }}>Team Stats</h2>
                <BarChart2 size={24} />
            </header>

            <div style={{ backgroundColor: 'var(--sd-white)', borderRadius: '12px', border: '1px solid var(--sd-dark-gray)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ backgroundColor: 'var(--sd-baby-blue)', color: 'var(--sd-black)' }}>
                        <tr>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)' }}>Player</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)' }}>AB</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)' }}>H</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)' }}>HR</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)' }}>RBI</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)', fontWeight: 'bold' }}>AVG</th>
                            <th style={{ padding: '0.75rem', borderBottom: '2px solid var(--sd-black)', fontWeight: 'bold' }}>OPS</th>
                        </tr>
                    </thead>
                    <tbody>
                        {playerStats.length === 0 ? (
                            <tr><td colSpan="7" style={{ padding: '1rem', textAlign: 'center' }}>No players on roster.</td></tr>
                        ) : (
                            playerStats.map(({ player, stats }) => (
                                <tr key={player.id} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{player.name}</td>
                                    <td style={{ padding: '0.75rem' }}>{stats.ab}</td>
                                    <td style={{ padding: '0.75rem' }}>{stats.hits}</td>
                                    <td style={{ padding: '0.75rem' }}>{stats.homeRuns}</td>
                                    <td style={{ padding: '0.75rem' }}>{stats.rbi}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold', color: 'var(--sd-accent)' }}>{stats.average}</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{stats.ops}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fffbe6', border: '1px dashed #e6c200', borderRadius: '8px', color: '#665500' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', textAlign: 'center' }}>
                    <strong>Note:</strong> Advanced heat maps and spray charts will be generated from the `location` property saved in the event logs in upcoming updates.
                </p>
            </div>
        </div>
    );
};

export default StatsScreen;
