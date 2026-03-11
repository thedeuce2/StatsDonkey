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

    const [isLineupModalOpen, setIsLineupModalOpen] = useState(false);

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
        if (game.isTopInning && game.opponentLineup) {
            return game.opponentLineup[game.currentBatterIndex.opponent] || `Away Batter ${game.currentBatterIndex.opponent + 1}`;
        } else if (!game.isTopInning && game.myLineup) {
            return game.myLineup[game.currentBatterIndex.myTeam] || `Home Batter ${game.currentBatterIndex.myTeam + 1}`;
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

    const handleSaveLineups = (awayLineup, homeLineup) => {
        updateLineups(awayLineup, homeLineup);
    };

    return (
        <div className="game-container" style={{ width: '100%', height: '100dvh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sd-dark-bg)', overflow: 'hidden' }}>

            {/* Top Bar with Lineup Button */}
            <div style={{ backgroundColor: 'var(--sd-white)', color: 'var(--sd-baby-blue)', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #ccc', zIndex: 50 }}>
                <button
                    onClick={() => setIsLineupModalOpen(true)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--sd-accent)', padding: '0', fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    Menu
                </button>
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
