import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import Scoreboard from '../components/Scoreboard';
import LineScore from '../components/LineScore';
import PlayEntry from '../components/PlayEntry';
import LineupModal from '../components/LineupModal';
import RunnerControlModal from '../components/RunnerControlModal';
import { Users } from 'lucide-react';

const InGameScreen = () => {
    const navigate = useNavigate();
    const { state, recordPlay, undoPlay, updateLineups, getBatterGameStats } = useGame();

    const [isLineupModalOpen, setIsLineupModalOpen] = useState(() => {
        // Automatically open the modal if both lineups are completely empty (i.e., a brand-new game)
        const g = state?.currentGame;
        return g && (!g.myLineup || g.myLineup.length === 0) && (!g.opponentLineup || g.opponentLineup.length === 0);
    });

    // Runner Control State
    const [runnerModalData, setRunnerModalData] = useState(null);
    const [viewMode, setViewMode] = useState('FIELD'); // 'FIELD', 'LOG', 'STATS'

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

    // Determines current batter's name if lineup is set
    const getCurrentBatterName = () => {
        const oppIndex = game.currentBatterIndex?.opponent || 0;
        const myIndex = game.currentBatterIndex?.myTeam || 0;
        
        if (game.isTopInning && game.opponentLineup && game.opponentLineup.length > 0) {
            const player = game.opponentLineup[oppIndex];
            return player?.name || player || `Away Batter ${oppIndex + 1}`;
        } else if (!game.isTopInning && game.myLineup && game.myLineup.length > 0) {
            const player = game.myLineup[myIndex];
            return player?.name || player || `Home Batter ${myIndex + 1}`;
        }
        return 'Batter';
    };

    const handleInitialPlayEntry = (playRequest) => {
        // playRequest: { hitType: '1B', errorDetail: {...} } or { isOutTrigger: true, type: 'OUT' }
        setRunnerModalData({
            hitType: playRequest.hitType,
            isOutTrigger: playRequest.isOutTrigger,
            errorDetail: playRequest.errorDetail,
            bases: game.bases,
            currentBatterName: getCurrentBatterName()
        });
    };

    const confirmRunnerAdvancement = (explicitPlayResult) => {
        // explicitPlayResult: { runsScored, scorers, outsRecorded, newBases, hitType, isOutTrigger, errorDetail }
        recordPlay(explicitPlayResult);
        setRunnerModalData(null);
    };

    const handleSaveLineups = (awayLineup, homeLineup, awayBench, homeBench) => {
        updateLineups(awayLineup, homeLineup, awayBench, homeBench);
    };

    const simAtBat = () => {
        const rand = Math.random();
        let hitType = null;
        let isOutTrigger = false;

        // Probabilities: 40% Out, 5% ROE, 30% 1B, 13% 2B, 4% 3B, 8% HR
        if (rand < 0.40) isOutTrigger = true;
        else if (rand < 0.45) hitType = 'ROE';
        else if (rand < 0.75) hitType = '1B';
        else if (rand < 0.88) hitType = '2B';
        else if (rand < 0.92) hitType = '3B';
        else hitType = 'HR';

        // Auto-Advancement Logic (standard logic)
        let runsScored = 0;
        const scorers = [];
        let outsRecorded = isOutTrigger ? 1 : 0;
        const newBases = { ...game.bases };

        const batterName = getCurrentBatterName();

        if (isOutTrigger) {
            // Simple out, nobody moves in this sim
        } else if (hitType === '1B' || hitType === 'ROE') {
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

        recordPlay({
            runsScored,
            scorers,
            outsRecorded,
            newBases,
            hitType,
            isOutTrigger,
            currentBatterName: batterName
        });
    };

    // --- Stats Compilation ---
    const compileStats = () => {
        const stats = { away: {}, home: {} };
        const initPlayer = (name) => ({ name, pa: 0, ab: 0, h: 0, r: 0, rbi: 0, h1b: 0, h2b: 0, h3b: 0, hhr: 0, bb: 0, roe: 0, out: 0 });

        const teams = [
            { id: 'away', lineup: game.opponentLineup, bench: game.opponentBench },
            { id: 'home', lineup: game.myLineup, bench: game.myBench }
        ];

        teams.forEach(t => {
            [...(t.lineup || []), ...(t.bench || [])].forEach(p => {
                const pName = p.name || (typeof p === 'string' ? p : null);
                if (pName) stats[t.id][pName] = initPlayer(pName);
            });
        });

        game.events.forEach((event) => {
            const play = event.playInfo;
            const isAwayBatting = event.stateBefore.isTopInning;
            const teamId = isAwayBatting ? 'away' : 'home';
            const batterName = play.currentBatterName;

            if (!batterName) return;
            if (!stats[teamId][batterName]) stats[teamId][batterName] = initPlayer(batterName);
            
            const s = stats[teamId][batterName];
            s.pa++;
            
            if (play.hitType === 'WALK') {
                s.bb++;
            } else {
                s.ab++;
                if (play.hitType === '1B') { s.h++; s.h1b++; }
                else if (play.hitType === '2B') { s.h++; s.h2b++; }
                else if (play.hitType === '3B') { s.h++; s.h3b++; }
                else if (play.hitType === 'HR') { s.h++; s.hhr++; }
                else if (play.hitType === 'ROE') s.roe++;
                else s.out++;
            }
            s.rbi += (play.runsScored || 0);

            if (play.scorers) {
                play.scorers.forEach(scorerName => {
                    const scorerStats = stats.away[scorerName] || stats.home[scorerName];
                    if (scorerStats) scorerStats.r++;
                });
            }
        });

        return stats;
    };

    const statsData = compileStats();

    return (
        <div className="game-container" style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sd-dark-bg)', overflow: 'hidden' }}>

            {/* Top Bar */}
            <div style={{ backgroundColor: 'var(--sd-white)', color: 'var(--sd-baby-blue)', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', zIndex: 50 }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        onClick={() => setIsLineupModalOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--sd-accent)', padding: '0', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                    >
                        Menu
                    </button>
                    <button
                        onClick={simAtBat}
                        style={{ background: 'var(--sd-accent)', border: 'none', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Sim AB
                    </button>
                </div>
                
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#eee', padding: '2px', borderRadius: '6px', border: '1px solid #ddd' }}>
                    <button onClick={() => setViewMode('FIELD')} style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: viewMode === 'FIELD' ? 'var(--sd-accent)' : 'transparent', color: viewMode === 'FIELD' ? 'white' : '#666', cursor: 'pointer' }}>FIELD</button>
                    <button onClick={() => setViewMode('LOG')} style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: viewMode === 'LOG' ? 'var(--sd-accent)' : 'transparent', color: viewMode === 'LOG' ? 'white' : '#666', cursor: 'pointer' }}>LOG</button>
                    <button onClick={() => setViewMode('STATS')} style={{ padding: '4px 8px', border: 'none', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: viewMode === 'STATS' ? 'var(--sd-accent)' : 'transparent', color: viewMode === 'STATS' ? 'white' : '#666', cursor: 'pointer' }}>STATS</button>
                </div>

                <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--sd-black)', letterSpacing: '1px' }}>STATSDONKEY</div>
            </div>

            <Scoreboard game={game} awayName={awayTeamName} homeName={homeTeamName} />

            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                
                {viewMode === 'FIELD' && (
                    <>
                        <div style={{ display: 'flex', borderBottom: '2px solid #333', backgroundColor: 'var(--sd-surface)', color: 'var(--sd-white)' }}>
                            <div style={{ flex: 1, padding: '0.4rem', borderRight: '1px solid #444', borderLeft: '3px solid #ccc' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '24px', textAlign: 'center', color: '#888', fontWeight: 'bold', marginRight: '4px', fontSize: '0.8rem' }}>AB</div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: 'var(--sd-baby-blue)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{getCurrentBatterName()}</span>
                                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Batting {game.isTopInning ? game.currentBatterIndex.opponent + 1 : game.currentBatterIndex.myTeam + 1} of 9, {(() => {
                                            const stats = getBatterGameStats(getCurrentBatterName());
                                            return `${stats.hits}-${stats.ab}`;
                                        })()}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{ flex: 1, padding: '0.4rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div style={{ width: '24px', textAlign: 'center', color: '#888', fontWeight: 'bold', marginRight: '4px', fontSize: '0.8rem' }}>P</div>
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ color: 'var(--sd-baby-blue)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Opposing Pitcher</span>
                                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Pitch Count: 0, 0.0 IP</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                            <PlayEntry onRecordPlay={handleInitialPlayEntry} onUndo={undoPlay} />
                        </div>
                    </>
                )}

                {viewMode === 'LOG' && (
                    <div style={{ padding: '1rem', overflowY: 'auto', backgroundColor: 'white', height: '100%', color: 'black' }}>
                        <h3 style={{ borderBottom: '2px solid var(--sd-accent)', paddingBottom: '0.5rem' }}>Game Log</h3>
                        {[...game.events].reverse().map((ev, i) => {
                            const p = ev.playInfo;
                            const inning = ev.stateBefore.inning;
                            const half = ev.stateBefore.isTopInning ? 'Top' : 'Bot';
                            return (
                                <div key={i} style={{ padding: '0.75rem 0', borderBottom: '1px solid #eee', display: 'flex', gap: '1rem' }}>
                                    <span style={{ color: 'gray', fontSize: '0.8rem', minWidth: '40px' }}>{half} {inning}</span>
                                    <div>
                                        <strong>{p.currentBatterName}</strong>: {p.hitType || (p.isOutTrigger ? 'OUT' : 'Play')}
                                        {p.runsScored > 0 && <span style={{ color: 'green', marginLeft: '0.5rem' }}>(+{p.runsScored} Run{p.runsScored > 1 ? 's' : ''})</span>}
                                    </div>
                                </div>
                            );
                        })}
                        {game.events.length === 0 && <div style={{ textAlign: 'center', padding: '2rem', color: 'gray' }}>No plays recorded yet.</div>}
                    </div>
                )}

                {viewMode === 'STATS' && (
                    <div style={{ padding: '1rem', overflowY: 'scroll', backgroundColor: 'white', height: '100%', color: 'black' }}>
                        {['away', 'home'].map(side => (
                            <div key={side} style={{ marginBottom: '2rem' }}>
                                <h3 style={{ borderBottom: '2px solid var(--sd-accent)', paddingBottom: '0.5rem', textTransform: 'uppercase' }}>
                                    {side === 'away' ? awayTeamName : homeTeamName} Stats
                                </h3>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                                        <thead>
                                            <tr style={{ backgroundColor: '#f5f5f5', textAlign: 'left' }}>
                                                <th style={{ padding: '8px' }}>PLAYER</th>
                                                <th style={{ padding: '8px' }}>AB</th>
                                                <th style={{ padding: '8px' }}>R</th>
                                                <th style={{ padding: '8px' }}>H</th>
                                                <th style={{ padding: '8px' }}>RBI</th>
                                                <th style={{ padding: '8px' }}>2B</th>
                                                <th style={{ padding: '8px' }}>3B</th>
                                                <th style={{ padding: '8px' }}>HR</th>
                                                <th style={{ padding: '8px' }}>AVG</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {Object.values(statsData[side]).map(p => (
                                                <tr key={p.name} style={{ borderBottom: '1px solid #eee' }}>
                                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.name}</td>
                                                    <td style={{ padding: '8px' }}>{p.ab}</td>
                                                    <td style={{ padding: '8px' }}>{p.r}</td>
                                                    <td style={{ padding: '8px' }}>{p.h}</td>
                                                    <td style={{ padding: '8px' }}>{p.rbi}</td>
                                                    <td style={{ padding: '8px' }}>{p.h2b}</td>
                                                    <td style={{ padding: '8px' }}>{p.h3b}</td>
                                                    <td style={{ padding: '8px' }}>{p.hhr}</td>
                                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>{p.ab > 0 ? (p.h / p.ab).toFixed(3).replace(/^0/, '') : '.000'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

            <LineupModal
                isOpen={isLineupModalOpen}
                onClose={() => setIsLineupModalOpen(false)}
                initialAway={game.opponentLineup}
                initialHome={game.myLineup}
                initialAwayBench={game.opponentBench}
                initialHomeBench={game.myBench}
                awayTeam={state.myTeam?.id === game.opponentTeamId ? state.myTeam : state.opponents.find(t => t.id === game.opponentTeamId)}
                homeTeam={state.myTeam?.id === game.myTeamId ? state.myTeam : state.opponents.find(t => t.id === game.myTeamId)}
                onSave={handleSaveLineups}
            />

            {runnerModalData && (
                <RunnerControlModal
                    isOpen={true}
                    onClose={() => setRunnerModalData(null)}
                    hitType={runnerModalData.hitType}
                    isOutTrigger={runnerModalData.isOutTrigger}
                    bases={runnerModalData.bases}
                    currentBatterName={runnerModalData.currentBatterName}
                    onConfirm={confirmRunnerAdvancement}
                />
            )}
        </div>
    );
};

export default InGameScreen;
