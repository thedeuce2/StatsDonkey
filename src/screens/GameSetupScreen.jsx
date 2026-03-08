import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createGameState, createTeam } from '../models/types';
import { ArrowLeft, PlayCircle } from 'lucide-react';

const GameSetupScreen = () => {
    const navigate = useNavigate();
    const { state, setMyTeam, addOpponent, startNewGame } = useGame();

    const [awayName, setAwayName] = useState('');
    const [homeName, setHomeName] = useState('');

    const handleStartGame = () => {
        if (!awayName.trim() || !homeName.trim()) {
            alert("Please enter both team names!");
            return;
        }

        const resolveTeam = (name, isMyTeamAttempt) => {
            const lowerName = name.toLowerCase();
            // Check if it's the current 'myTeam'
            if (state.myTeam && state.myTeam.name.toLowerCase() === lowerName) {
                return state.myTeam;
            }
            // Check opponents
            const existingOpp = state.opponents.find(t => t.name.toLowerCase() === lowerName);
            if (existingOpp) {
                return existingOpp;
            }
            // Create new
            const newTeam = createTeam({ name, isMyTeam: false });
            // If we don't have a myTeam yet, let's claim the Home team
            if (!state.myTeam && isMyTeamAttempt) {
                newTeam.isMyTeam = true;
                setMyTeam(newTeam);
            } else {
                addOpponent(newTeam);
            }
            return newTeam;
        };

        const awayTeam = resolveTeam(awayName.trim(), false);
        const homeTeam = resolveTeam(homeName.trim(), true);

        // Create new Game State
        const newGame = createGameState({
            myTeamId: homeTeam.id, // Designating Home as 'myTeamId' for context tracking
            opponentTeamId: awayTeam.id,
            myLineup: [],
            opponentLineup: []
        });

        startNewGame(newGame);
        navigate('/game');
    };

    return (
        <div className="screen-container" style={{ width: '100%', maxWidth: '600px', padding: '1rem', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="icon-btn" onClick={() => navigate('/')} style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ flexGrow: 1, margin: 0 }}>Score Sheet Setup</h2>
            </header>

            <div style={{ backgroundColor: 'var(--sd-white)', padding: '2rem', borderRadius: '12px', border: '3px solid var(--sd-dark-gray)' }}>
                <p style={{ color: 'gray', marginBottom: '2rem' }}>Enter the team names below to instantly start a new score sheet.</p>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#666' }}>Away Team</label>
                    <input
                        type="text"
                        value={awayName}
                        onChange={(e) => setAwayName(e.target.value)}
                        placeholder="e.g. The Isotopes"
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.2rem', boxSizing: 'border-box' }}
                    />
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#666' }}>Home Team</label>
                    <input
                        type="text"
                        value={homeName}
                        onChange={(e) => setHomeName(e.target.value)}
                        placeholder="e.g. Slugging Donkeys"
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.2rem', boxSizing: 'border-box' }}
                    />
                </div>

                <button
                    className="primary-btn flex-center"
                    onClick={handleStartGame}
                    style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--sd-accent)', color: 'white', fontSize: '1.5rem', padding: '1rem', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                >
                    <PlayCircle size={28} /> PLAY BALL
                </button>
            </div>
        </div>
    );
};

export default GameSetupScreen;
