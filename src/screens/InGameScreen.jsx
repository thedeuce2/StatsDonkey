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
        // explicitPlayResult: { runsScored, outsRecorded, newBases, hitType, isOutTrigger, errorDetail }
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
        let outsRecorded = isOutTrigger ? 1 : 0;
        const newBases = { ...game.bases };

        if (isOutTrigger) {
            // Simple out, nobody moves in this sim
        } else if (hitType === '1B' || hitType === 'ROE') {
            if (newBases.third) { runsScored++; newBases.third = false; }
            if (newBases.second) { newBases.third = true; newBases.second = false; }
            if (newBases.first) { newBases.second = true; }
            newBases.first = getCurrentBatterName();
        } else if (hitType === '2B') {
            if (newBases.third) { runsScored++; newBases.third = false; }
            if (newBases.second) { runsScored++; }
            if (newBases.first) { newBases.third = true; newBases.first = false; }
            newBases.second = getCurrentBatterName();
        } else if (hitType === '3B') {
            if (newBases.third) { runsScored++; }
            if (newBases.second) { runsScored++; newBases.second = false; }
            if (newBases.first) { runsScored++; newBases.first = false; }
            newBases.third = getCurrentBatterName();
        } else if (hitType === 'HR') {
            if (newBases.third) { runsScored++; newBases.third = false; }
            if (newBases.second) { runsScored++; newBases.second = false; }
            if (newBases.first) { runsScored++; newBases.first = false; }
            runsScored++; // The batter
        }

        recordPlay({
            runsScored,
            outsRecorded,
            newBases,
            hitType,
            isOutTrigger,
            currentBatterName: getCurrentBatterName()
        });
    };

    return (
        <div className="game-container" style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sd-dark-bg)', overflow: 'hidden' }}>

            {/* Top Bar with Lineup Button */}
            <div style={{ backgroundColor: 'var(--sd-white)', color: 'var(--sd-baby-blue)', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', zIndex: 50 }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button
                        onClick={() => setIsLineupModalOpen(true)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--sd-accent)', padding: '0', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        Menu
                    </button>
                    <button
                        onClick={simAtBat}
                        style={{ background: 'var(--sd-accent)', border: 'none', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                        Sim AB
                    </button>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--sd-black)', letterSpacing: '1px' }}>STATSDONKEY</div>
                <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', color: 'var(--sd-accent)', padding: 0 }}>
                    <Users size={20} />
                </button>
            </div>

            {/* 1. Scoreboard Header (Scores, Inning, Outs) - Always visible */}
            <Scoreboard game={game} awayName={awayTeamName} homeName={homeTeamName} />

            {/* 2. GameChanger Matchup Details Row */}
            <div style={{ display: 'flex', borderBottom: '2px solid #333', backgroundColor: 'var(--sd-surface)', color: 'var(--sd-white)' }}>
                {/* Batter Side */}
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

                {/* Pitcher Side */}
                <div style={{ flex: 1, padding: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ width: '24px', textAlign: 'center', color: '#888', fontWeight: 'bold', marginRight: '4px', fontSize: '0.8rem' }}>P</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ color: 'var(--sd-baby-blue)', fontWeight: 'bold', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>Opposing Pitcher</span>
                            <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Pitch Count: 0 (0), 0.0 IP</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Play Entry Dashboard - Fills remaining space and naturally expands to fit SVG */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <PlayEntry onRecordPlay={handleInitialPlayEntry} onUndo={undoPlay} />
            </div>

            {/* Modals */}
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
