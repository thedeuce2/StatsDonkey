import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createTeam } from '../models/types';
import { ArrowLeft, Save, Trash2, ShieldPlus } from 'lucide-react';

const OpponentManagementScreen = () => {
    const navigate = useNavigate();
    const { state, addOpponent } = useGame();

    const [opponents, setOpponents] = useState(state.opponents || []);
    const [newTeamName, setNewTeamName] = useState('');

    const handleAddTeam = (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        const newTeam = createTeam({
            name: newTeamName,
            isMyTeam: false
        });

        const updatedOpponents = [...opponents, newTeam];
        setOpponents(updatedOpponents);
        addOpponent(newTeam);

        setNewTeamName('');
    };

    const handleRemoveTeam = (id) => {
        // Note: this should probably update context later, but for now we just filter UI local state
        const updatedOpponents = opponents.filter(t => t.id !== id);
        setOpponents(updatedOpponents);
        // TODO: add removeOpponent function to GameContext
    };

    return (
        <div className="screen-container" style={{ width: '100%', maxWidth: '600px', padding: '1rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <button className="icon-btn" onClick={() => navigate('/')} style={{ marginRight: '1rem', background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                <h2 style={{ flexGrow: 1, margin: 0 }}>Opposing Teams</h2>
            </header>

            <form onSubmit={handleAddTeam} style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem' }}>
                <input
                    type="text"
                    placeholder="New Opponent Team Name"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    style={{ flexGrow: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid var(--sd-dark-gray)' }}
                />
                <button type="submit" className="primary-btn" style={{ padding: '0.5rem 1rem' }}>
                    <ShieldPlus size={20} />
                </button>
            </form>

            <div className="team-list" style={{ backgroundColor: 'var(--sd-white)', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--sd-dark-gray)' }}>
                {opponents.length === 0 ? (
                    <p style={{ padding: '1rem', textAlign: 'center', color: 'gray' }}>No opponents added yet.</p>
                ) : (
                    opponents.map(team => (
                        <div key={team.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ fontWeight: 'bold' }}>{team.name}</span>
                                <span style={{ fontSize: '0.8rem', color: 'gray' }}>({team.roster.length} players)</span>
                            </div>
                            <button
                                onClick={() => handleRemoveTeam(team.id)}
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

export default OpponentManagementScreen;
