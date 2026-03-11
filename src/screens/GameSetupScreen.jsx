import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createGameState, createTeam } from '../models/types';
import { ArrowLeft, PlayCircle } from 'lucide-react';

const GameSetupScreen = () => {
    const navigate = useNavigate();
    const { state, setMyTeam, addOpponent, startNewGame } = useGame();

    const allTeams = [state.myTeam, ...state.opponents].filter(Boolean);

    const [awaySelection, setAwaySelection] = useState(''); // '' means nothing chosen yet or 'NEW'
    const [homeSelection, setHomeSelection] = useState(state.myTeam ? state.myTeam.id : 'NEW');

    const [awayName, setAwayName] = useState('');
    const [homeName, setHomeName] = useState('');

    const handleStartGame = () => {
        try {
            const resolveTeam = (selection, customName, isMyTeamAttempt) => {
                if (selection && selection !== 'NEW') {
                    const existing = allTeams.find(t => t.id === selection);
                    if (existing) return existing;
                }

                if (!customName.trim()) {
                    throw new Error("Please enter a name for the new team!");
                }

                const name = customName.trim();
                const lowerName = name.toLowerCase();
                // Check if it already exists by name
                const existingByName = allTeams.find(t => t.name.toLowerCase() === lowerName);
                if (existingByName) return existingByName;

                // Create new
                const newTeam = createTeam({ name, isMyTeam: false });
                if (!state.myTeam && isMyTeamAttempt) {
                    newTeam.isMyTeam = true;
                    setMyTeam(newTeam);
                } else {
                    addOpponent(newTeam);
                }
                return newTeam;
            };

            const awayTeam = resolveTeam(awaySelection, awayName, false);
            const homeTeam = resolveTeam(homeSelection, homeName, true);

            // Create new Game State
            const newGame = createGameState({
                myTeamId: homeTeam.id, // Designating Home as 'myTeamId' for context tracking
                opponentTeamId: awayTeam.id,
                myLineup: [],
                opponentLineup: []
            });

            startNewGame(newGame);
            navigate('/game');
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <div className="screen-container" style={{ width: '100%', maxWidth: '600px', padding: '1rem', margin: '0 auto' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="icon-btn" onClick={() => navigate('/')} style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ flexGrow: 1, margin: 0 }}>Score Sheet Setup</h2>
            </header>

            <div style={{ backgroundColor: 'var(--sd-white)', padding: '2rem', borderRadius: '12px', border: '3px solid var(--sd-dark-gray)', color: 'var(--sd-black)' }}>
                <p style={{ color: 'gray', marginBottom: '2rem' }}>Select your teams setup.</p>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#666' }}>Away Team</label>
                    <select
                        value={awaySelection}
                        onChange={(e) => setAwaySelection(e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.2rem', marginBottom: '0.5rem', backgroundColor: 'white', color: 'black' }}
                    >
                        <option value="" disabled>Select a team...</option>
                        {allTeams.map(t => (
                            <option key={t.id} value={t.id}>{t.name} {t.isUserTeam ? '(My Team)' : ''}</option>
                        ))}
                        <option value="NEW">+ Create New Team...</option>
                    </select>
                    {awaySelection === 'NEW' && (
                        <input
                            type="text"
                            value={awayName}
                            onChange={(e) => setAwayName(e.target.value)}
                            placeholder="New Away Team Name"
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.2rem', boxSizing: 'border-box' }}
                        />
                    )}
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', fontSize: '1.2rem', color: '#666' }}>Home Team</label>
                    <select
                        value={homeSelection}
                        onChange={(e) => setHomeSelection(e.target.value)}
                        style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.2rem', marginBottom: '0.5rem', backgroundColor: 'white', color: 'black' }}
                    >
                        <option value="" disabled>Select a team...</option>
                        {allTeams.map(t => (
                            <option key={t.id} value={t.id}>{t.name} {t.isUserTeam ? '(My Team)' : ''}</option>
                        ))}
                        <option value="NEW">+ Create New Team...</option>
                    </select>
                    {homeSelection === 'NEW' && (
                        <input
                            type="text"
                            value={homeName}
                            onChange={(e) => setHomeName(e.target.value)}
                            placeholder="New Home Team Name"
                            style={{ width: '100%', padding: '1rem', borderRadius: '8px', border: '2px solid #ccc', fontSize: '1.2rem', boxSizing: 'border-box' }}
                        />
                    )}
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
