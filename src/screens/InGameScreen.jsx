import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Scoreboard from '../components/Scoreboard';
import LineScore from '../components/LineScore';
import PlayEntry from '../components/PlayEntry';
import LineupModal from '../components/LineupModal';
import RunnerControlModal from '../components/RunnerControlModal';
import { Users, LayoutList, TableProperties } from 'lucide-react';

const InGameScreen = () => {
    const navigate = useNavigate();
    const { state, recordPlay, undoPlay, updateLineups, getBatterGameStats } = useGame();

    const [isLineupModalOpen, setIsLineupModalOpen] = useState(() => {
        const g = state?.currentGame;
        return g && (!g.myLineup || g.myLineup.length === 0) && (!g.opponentLineup || g.opponentLineup.length === 0);
    });

    const [runnerModalData, setRunnerModalData] = useState(null);
    
    // Sidebar Visibilities
    const [showLog, setShowLog] = useState(window.innerWidth > 1024);
    const [showStats, setShowStats] = useState(window.innerWidth > 1280);

    const game = state.currentGame;

    if (!game) {
        return (
            <div className="flex-center" style={{ width: '100%', height: '100%', flexDirection: 'column' }}>
                <h2>No Active Game</h2>
                <button className="primary-btn mt-4" onClick={() => navigate('/setup')}>Go to Setup</button>
            </div>
        );
    }

    const getTeamName = (teamId) => {
        if (state.myTeam && state.myTeam.id === teamId) return state.myTeam.name;
        const opp = state.opponents.find(t => t.id === teamId);
        return opp ? opp.name : 'Unknown Team';
    };

    const awayTeamName = getTeamName(game.opponentTeamId);
    const homeTeamName = getTeamName(game.myTeamId);

    const getCurrentBatterName = () => {
        const oppIndex = game.currentBatterIndex?.opponent || 0;
        const myIndex = game.currentBatterIndex?.myTeam || 0;
        if (game.isTopInning && game.opponentLineup?.[oppIndex]) return game.opponentLineup[oppIndex].name || game.opponentLineup[oppIndex];
        if (!game.isTopInning && game.myLineup?.[myIndex]) return game.myLineup[myIndex].name || game.myLineup[myIndex];
        return 'Batter';
    };

    const handleInitialPlayEntry = (playRequest) => {
        setRunnerModalData({
            ...playRequest,
            bases: game.bases,
            currentBatterName: getCurrentBatterName()
        });
    };

    const confirmRunnerAdvancement = (res) => {
        recordPlay(res);
        setRunnerModalData(null);
    };

    const simAtBat = () => {
        const rand = Math.random();
        let hitType = null;
        let isOutTrigger = false;
        if (rand < 0.40) isOutTrigger = true;
        else if (rand < 0.45) hitType = 'ROE';
        else if (rand < 0.75) hitType = '1B';
        else if (rand < 0.88) hitType = '2B';
        else if (rand < 0.92) hitType = '3B';
        else hitType = 'HR';

        let runsScored = 0;
        const scorers = [];
        let outsRecorded = isOutTrigger ? 1 : 0;
        const newBases = { ...game.bases };
        const batterName = getCurrentBatterName();

        if (isOutTrigger) { /* No movement */ }
        else if (hitType === '1B' || hitType === 'ROE') {
            if (newBases.third) { runsScored++; scorers.push(newBases.third); newBases.third = false; }
            if (newBases.second) { newBases.third = newBases.second; newBases.second = false; }
            if (newBases.first) { newBases.second = newBases.first; }
            newBases.first = batterName;
        } else if (hitType === '2B') {
            if (newBases.third) { runsScored++; scorers.push(newBases.third); newBases.third = false; }
            if (newBases.second) { runsScored++; scorers.push(newBases.second); }
            if (newBases.first) { newBases.third = newBases.first; newBases.first = false; }
            newBases.second = batterName;
        } else if (hitType === '3B') {
            if (newBases.third) { runsScored++; scorers.push(newBases.third); }
            if (newBases.second) { runsScored++; scorers.push(newBases.second); newBases.second = false; }
            if (newBases.first) { runsScored++; scorers.push(newBases.first); newBases.first = false; }
            newBases.third = batterName;
        } else if (hitType === 'HR') {
            if (newBases.third) { runsScored++; scorers.push(newBases.third); newBases.third = false; }
            if (newBases.second) { runsScored++; scorers.push(newBases.second); newBases.second = false; }
            if (newBases.first) { runsScored++; scorers.push(newBases.first); newBases.first = false; }
            runsScored++; scorers.push(batterName);
        }

        recordPlay({ runsScored, scorers, outsRecorded, newBases, hitType, isOutTrigger, currentBatterName: batterName });
    };

    const compileStats = () => {
        const stats = { away: {}, home: {} };
        const initP = (n) => ({ name: n, pa: 0, ab: 0, h: 0, r: 0, rbi: 0, h1b: 0, h2b: 0, h3b: 0, hhr: 0, bb: 0, roe: 0, out: 0 });
        const addP = (side, arr) => (arr || []).forEach(p => { const n = p.name || (typeof p === 'string' ? p : null); if (n) stats[side][n] = initP(n); });
        addP('away', game.opponentLineup); addP('away', game.opponentBench);
        addP('home', game.myLineup); addP('home', game.myBench);

        game.events.forEach(ev => {
            const p = ev.playInfo;
            const side = ev.stateBefore.isTopInning ? 'away' : 'home';
            if (!p.currentBatterName) return;
            if (!stats[side][p.currentBatterName]) stats[side][p.currentBatterName] = initP(p.currentBatterName);
            const s = stats[side][p.currentBatterName];
            s.pa++;
            if (p.hitType === 'WALK') s.bb++;
            else {
                s.ab++;
                if (p.hitType === '1B') { s.h++; s.h1b++; }
                else if (p.hitType === '2B') { s.h++; s.h2b++; }
                else if (p.hitType === '3B') { s.h++; s.h3b++; }
                else if (p.hitType === 'HR') { s.h++; s.hhr++; }
                else if (p.hitType === 'ROE') s.roe++;
                else s.out++;
            }
            s.rbi += (p.runsScored || 0);
            if (p.scorers) p.scorers.forEach(sn => { const ss = stats.away[sn] || stats.home[sn]; if (ss) ss.r++; });
        });
        return stats;
    };

    const statsData = compileStats();

    return (
        <div className="game-container" style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sd-dark-bg)', overflow: 'hidden' }}>

            {/* Top Bar */}
            <div style={{ backgroundColor: 'var(--sd-white)', color: 'var(--sd-baby-blue)', padding: '0.4rem 0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', zIndex: 60 }}>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button onClick={() => setIsLineupModalOpen(true)} style={{ background: 'transparent', border: 'none', color: 'var(--sd-accent)', padding: '0.2rem', cursor: 'pointer', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>Menu</button>
                    <button onClick={simAtBat} style={{ background: 'var(--sd-accent)', border: 'none', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}>SIM AB</button>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button onClick={() => setShowLog(!showLog)} style={{ background: 'none', border: 'none', color: showLog ? 'var(--sd-accent)' : '#aaa', cursor: 'pointer' }} title="Toggle Log"><LayoutList size={22} /></button>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--sd-black)', letterSpacing: '1px', padding: '0 1rem' }}>STATSDONKEY</div>
                    <button onClick={() => setShowStats(!showStats)} style={{ background: 'none', border: 'none', color: showStats ? 'var(--sd-accent)' : '#aaa', cursor: 'pointer' }} title="Toggle Stats"><TableProperties size={22} /></button>
                </div>

                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--sd-accent)', padding: 0 }}><Users size={22} /></button>
            </div>

            {/* Main Panel Area: Sidebars + Center Canvas */}
            <div style={{ flexGrow: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
                
                {/* Left Sidebar: Play Log */}
                {showLog && (
                    <div className="sidebar-log" style={{ width: 'clamp(200px, 18%, 300px)', backgroundColor: 'white', borderRight: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>
                        <div style={{ padding: '0.6rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', color: '#666' }}>Play Log</div>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0.4rem' }}>
                            {[...game.events].reverse().map((ev, i) => (
                                <div key={i} style={{ padding: '0.5rem', borderBottom: '1px solid #f0f0f0', fontSize: '0.85rem' }}>
                                    <div style={{ color: '#888', fontSize: '0.7rem' }}>{ev.stateBefore.isTopInning ? 'Top' : 'Bot'} {ev.stateBefore.inning}</div>
                                    <strong>{ev.playInfo.currentBatterName}</strong>: {ev.playInfo.hitType || (ev.playInfo.isOutTrigger ? 'OUT' : 'Play')}
                                    {ev.playInfo.runsScored > 0 && <span style={{ color: 'var(--sd-accent)', fontWeight: 'bold', marginLeft: '4px' }}>+{ev.playInfo.runsScored}</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Center Panel: Field & Scoreboard */}
                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
                    <Scoreboard game={game} awayName={awayTeamName} homeName={homeTeamName} />
                    
                    {/* Matchup row */}
                    <div style={{ display: 'flex', borderBottom: '2px solid #333', backgroundColor: 'var(--sd-surface)', color: 'var(--sd-white)', fontSize: '0.9rem' }}>
                        <div style={{ flex: 1, padding: '0.4rem', borderRight: '1px solid #444', borderLeft: '3px solid #ccc' }}>
                            <div style={{ color: '#888', fontWeight: 'bold', fontSize: '0.7rem' }}>BATTER</div>
                            <strong>{getCurrentBatterName()}</strong> ({(() => { const s = getBatterGameStats(getCurrentBatterName()); return `${s.hits}-${s.ab}`; })()})
                        </div>
                        <div style={{ flex: 1, padding: '0.4rem' }}>
                            <div style={{ color: '#888', fontWeight: 'bold', fontSize: '0.7rem' }}>PITCHER</div>
                            <strong>Opposing P</strong> (0 Pitches)
                        </div>
                    </div>

                    <div style={{ flexGrow: 1, position: 'relative' }}>
                        <PlayEntry onRecordPlay={handleInitialPlayEntry} onUndo={undoPlay} />
                    </div>
                </div>

                {/* Right Sidebar: Stats Table */}
                {showStats && (
                    <div className="sidebar-stats" style={{ width: 'clamp(250px, 22%, 400px)', backgroundColor: 'white', borderLeft: '1px solid #ddd', display: 'flex', flexDirection: 'column', overflow: 'hidden', zIndex: 10 }}>
                        <div style={{ padding: '0.6rem', backgroundColor: '#f8f9fa', borderBottom: '1px solid #eee', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', color: '#666' }}>Box Score</div>
                        <div style={{ flexGrow: 1, overflowY: 'auto', padding: '0' }}>
                            {['away', 'home'].map(side => (
                                <div key={side} style={{ marginBottom: '1rem' }}>
                                    <div style={{ backgroundColor: '#eee', padding: '4px 8px', fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--sd-accent)' }}>{side === 'away' ? 'AWAY' : 'HOME'}</div>
                                    <table style={{ width: '100%', fontSize: '0.8rem', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#fafafa', textAlign: 'left', borderBottom: '1px solid #ddd' }}>
                                                <th style={{ padding: '4px 8px' }}>P</th>
                                                <th style={{ padding: '4px' }}>AB</th>
                                                <th style={{ padding: '4px' }}>H</th>
                                                <th style={{ padding: '4px' }}>R</th>
                                                <th style={{ padding: '4px' }}>AVG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(statsData[side]).map(p => (
                                                <tr key={p.name} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '4px 8px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80px' }}>{p.name}</td>
                                                    <td style={{ padding: '4px' }}>{p.ab}</td>
                                                    <td style={{ padding: '4px' }}>{p.h}</td>
                                                    <td style={{ padding: '4px' }}>{p.r}</td>
                                                    <td style={{ padding: '4px', fontWeight: 'bold' }}>{p.ab > 0 ? (p.h/p.ab).toFixed(3).replace(/^0/,'') : '.000'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <LineupModal
                isOpen={isLineupModalOpen} onClose={() => setIsLineupModalOpen(false)}
                initialAway={game.opponentLineup} initialHome={game.myLineup}
                initialAwayBench={game.opponentBench} initialHomeBench={game.myBench}
                awayTeam={state.opponents.find(t => t.id === game.opponentTeamId)}
                homeTeam={state.myTeam} onSave={updateLineups}
            />

            {runnerModalData && (
                <RunnerControlModal
                    isOpen={true} onClose={() => setRunnerModalData(null)}
                    hitType={runnerModalData.hitType} isOutTrigger={runnerModalData.isOutTrigger}
                    bases={runnerModalData.bases} currentBatterName={runnerModalData.currentBatterName}
                    onConfirm={confirmRunnerAdvancement}
                />
            )}
        </div>
    );
};

export default InGameScreen;
