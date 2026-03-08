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
    const { state, recordPlay, undoPlay, updateLineups } = useGame();

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
        // playRequest: { hitType: '1B' } or { isOutTrigger: true, type: 'OUT' }
        setRunnerModalData({
            hitType: playRequest.hitType,
            isOutTrigger: playRequest.isOutTrigger,
            bases: game.bases,
            currentBatterName: getCurrentBatterName()
        });
    };

    const confirmRunnerAdvancement = (explicitPlayResult) => {
        // explicitPlayResult: { runsScored, outsRecorded, newBases, hitType, isOutTrigger }
        recordPlay(explicitPlayResult);
        setRunnerModalData(null);
    };

    const handleSaveLineups = (awayLineup, homeLineup) => {
        updateLineups(awayLineup, homeLineup);
    };

    return (
        <div className="game-container" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>

            {/* Top Bar with Lineup Button */}
            <div style={{ backgroundColor: 'var(--sd-black)', color: 'white', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={() => setIsLineupModalOpen(true)}
                    style={{ background: 'transparent', border: '1px solid white', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Users size={16} /> Lineups
                </button>
                <div style={{ fontSize: '0.9rem' }}>StatsDonkey</div>
            </div>

            {/* 1. Scoreboard Header (Scores, Inning, Outs) */}
            <Scoreboard game={game} awayName={awayTeamName} homeName={homeTeamName} />

            {/* Main scrollable area */}
            <div style={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

                {/* 2. Line Score Table */}
                <LineScore lineScore={game.lineScore} awayName={awayTeamName} homeName={homeTeamName} />

                {/* Optional: Simple Base Runner Visualization */}
                <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e2f0d9', borderBottom: '2px solid #ccc' }}>

                    <div style={{ flex: 1, fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--sd-dark-gray)' }}>
                        <div style={{ fontSize: '0.8rem', color: 'gray', textTransform: 'uppercase' }}>At Bat</div>
                        {getCurrentBatterName()}
                    </div>

                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ width: 30, height: 30, transform: 'rotate(45deg)', backgroundColor: game.bases.second ? '#ffeb3b' : 'white', border: '2px solid black', margin: '0 auto 10px' }}></div>
                        <div style={{ display: 'flex', gap: '40px', justifyContent: 'center' }}>
                            <div style={{ width: 30, height: 30, transform: 'rotate(45deg)', backgroundColor: game.bases.third ? '#ffeb3b' : 'white', border: '2px solid black' }}></div>
                            <div style={{ width: 30, height: 30, transform: 'rotate(45deg)', backgroundColor: game.bases.first ? '#ffeb3b' : 'white', border: '2px solid black' }}></div>
                        </div>
                        <div style={{ width: 30, height: 30, backgroundColor: 'white', border: '2px solid black', borderRadius: '4px', margin: '10px auto 0' }}></div>
                    </div>

                    <div style={{ flex: 1 }}></div> {/* Spacer for flex balance */}
                </div>

                {/* 3. Play Entry Dashboard */}
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
