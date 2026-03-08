import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createPlayer } from '../models/types';
import { UserPlus, ArrowLeft, Save, Trash2 } from 'lucide-react';

const TeamManagementScreen = () => {
    const navigate = useNavigate();
    const { state, updateMyRoster } = useGame();

    const [roster, setRoster] = useState(state.myTeam?.roster || []);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');

    const handleAddPlayer = (e) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;

        const newPlayer = createPlayer({
            name: newPlayerName,
            number: newPlayerNumber
        });

        const updatedRoster = [...roster, newPlayer];
        setRoster(updatedRoster);
        updateMyRoster(updatedRoster);

        setNewPlayerName('');
        setNewPlayerNumber('');
    };

    const handleRemovePlayer = (id) => {
        const updatedRoster = roster.filter(p => p.id !== id);
        setRoster(updatedRoster);
        updateMyRoster(updatedRoster);
    };

    return (
        <div className="screen-container" style={{ width: '100%', maxWidth: '600px', padding: '1rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="icon-btn" onClick={() => navigate('/')} style={{ marginRight: '1rem', background: 'none', border: 'none' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ flexGrow: 1, margin: 0 }}>My Team Roster</h2>
            </header>

            <form onSubmit={handleAddPlayer} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="Player Name"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--sd-dark-gray)' }}
                />
                <input
                    type="text"
                    placeholder="#"
                    value={newPlayerNumber}
                    onChange={(e) => setNewPlayerNumber(e.target.value)}
                    style={{ width: '60px', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--sd-dark-gray)' }}
                />
                <button type="submit" className="primary-btn" style={{ padding: '0.5rem 1rem' }}>
                    <UserPlus size={20} />
                </button>
            </form>

            <div className="roster-list" style={{ backgroundColor: 'var(--sd-white)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--sd-dark-gray)' }}>
                {roster.length === 0 ? (
                    <p style={{ padding: '1rem', textAlign: 'center', color: 'gray' }}>No players added yet. Add some donkeys!</p>
                ) : (
                    roster.map(player => (
                        <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold', width: '30px', color: 'var(--sd-accent)' }}>#{player.number}</span>
                                <span>{player.name}</span>
                            </div>
                            <button
                                onClick={() => handleRemovePlayer(player.id)}
                                style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: '0.5rem' }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TeamManagementScreen;
