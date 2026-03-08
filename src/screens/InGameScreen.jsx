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
        <div className="game-container" style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>

            {/* Top Bar with Lineup Button */}
            <div style={{ backgroundColor: 'var(--sd-black)', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 50 }}>
                <button
                    onClick={() => setIsLineupModalOpen(true)}
                    style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Users size={16} /> Lineups
                </button>
                <div style={{ fontSize: '0.9rem' }}>StatsDonkey</div>
            </div>

            {/* 1. Scoreboard Header (Scores, Inning, Outs) - Always visible */}
            <Scoreboard game={game} awayName={awayTeamName} homeName={homeTeamName} />

            {/* Main scrollable area for LineScore if needed */}
            <div style={{ flexShrink: 0 }}>
                {/* 2. Line Score Table */}
                <LineScore lineScore={game.lineScore} awayName={awayTeamName} homeName={homeTeamName} />

                {/* 3-Column At-Bat Dashboard */}
                <div style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem', backgroundColor: '#e2f0d9', borderBottom: '2px solid #ccc', minHeight: '80px' }}>

                    {/* Col 1: Batter & Game Stats */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #ccc', paddingRight: '0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'gray', textTransform: 'uppercase', fontWeight: 'bold' }}>Now Batting</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--sd-dark-gray)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {getCurrentBatterName()}
                        </div>

                        {(() => {
                            const stats = getBatterGameStats(getCurrentBatterName());
                            return (
                                <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#444' }}>
                                    <div><strong>{stats.hits}</strong> for <strong>{stats.ab}</strong></div>
                                    <div style={{ color: 'gray', fontSize: '0.75rem' }}>{stats.log.join(', ') || '-'}</div>
                                </div>
                            );
                        })()}
                    </div>

                    {/* Col 2: Cumulative Stats (Placeholder) */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', borderRight: '1px solid #ccc', padding: '0 0.5rem' }}>
                        <div style={{ fontSize: '0.7rem', color: 'gray', textTransform: 'uppercase', fontWeight: 'bold' }}>Season Stats</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            <div><span style={{ color: '#777' }}>AVG:</span> .450</div>
                            <div><span style={{ color: '#777' }}>OBP:</span> .520</div>
                            <div><span style={{ color: '#777' }}>HR:</span> 12</div>
                            <div><span style={{ color: '#777' }}>RBI:</span> 45</div>
                        </div>
                    </div>

                    {/* Col 3: Spray Chart (Placeholder) */}
                    <div style={{ width: '80px', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#d5e8cb', borderRadius: '4px', border: '1px dashed #88b06a' }}>
                        <div style={{ fontSize: '0.65rem', color: '#558036', textAlign: 'center', fontWeight: 'bold', textTransform: 'uppercase' }}>Spray<br />Chart<br />Pipeline</div>
                    </div>

                </div>
            </div>

            {/* 3. Play Entry Dashboard - Fills remaining space and naturally expands to fit SVG */}
            <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', paddingBottom: '1rem' }}>
                <PlayEntry onRecordPlay={handleInitialPlayEntry} onUndo={undoPlay} />
            </div>

            {/* Quit/Finish Button */}
            <button
                onClick={() => navigate('/')}
                style={{ padding: '1rem', backgroundColor: 'var(--sd-black)', color: 'white', border: 'none', fontSize: '1rem', fontWeight: 'bold' }}>
                Save & Exit to Menu
            </button>

            {/* Modals */}
            <LineupModal
                isOpen={isLineupModalOpen}
                onClose={() => setIsLineupModalOpen(false)}
                initialAway={game.opponentLineup}
                initialHome={game.myLineup}
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
