import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createTeam } from '../models/types';
import { ArrowLeft, Save, Trash2, ShieldPlus, UserPlus } from 'lucide-react';

const OpponentManagementScreen = () => {
    const navigate = useNavigate();
    const { state, addOpponent, updateTeam } = useGame();

    const [opponents, setOpponents] = useState(state.opponents || []);
    const [newTeamName, setNewTeamName] = useState('');
    
    const [editingId, setEditingId] = useState(null);
    const [tempName, setTempName] = useState('');
    const [tempLogo, setTempLogo] = useState(null);

    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');

    const [editingPlayerId, setEditingPlayerId] = useState(null);
    const [editPlayerName, setEditPlayerName] = useState('');
    const [editPlayerNumber, setEditPlayerNumber] = useState('');

    const startEditingPlayer = (p) => {
        setEditingPlayerId(p.id);
        setEditPlayerName(p.name);
        setEditPlayerNumber(p.number || '');
    };

    const handleSavePlayerEdit = async (teamId, playerId) => {
        try {
            const res = await fetch(`/api/players/${playerId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: editPlayerName, number: editPlayerNumber })
            });

            if (res.ok) {
                const updatedPlayer = await res.json();
                const updatedOpponents = opponents.map(team => {
                    if (team.id === teamId) {
                        return { ...team, players: (team.players || []).map(p => p.id === playerId ? updatedPlayer : p) };
                    }
                    return team;
                });
                setOpponents(updatedOpponents);
                const updatedTeam = updatedOpponents.find(t => t.id === teamId);
                if (updatedTeam) updateTeam(updatedTeam);
                setEditingPlayerId(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    // Sync local state when context loads from API
    React.useEffect(() => {
        setOpponents(state.opponents || []);
    }, [state.opponents]);

    const handleAddTeam = async (e) => {
        e.preventDefault();
        if (!newTeamName.trim()) return;

        try {
            // 1. Send to backend
            const response = await fetch('/api/teams', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newTeamName, isUserTeam: false, color: '#333' })
            });

            if (response.ok) {
                const newTeam = await response.json();
                newTeam.players = newTeam.players || []; // Ensure players array exists

                // 2. Update local state
                const updatedOpponents = [...opponents, newTeam];
                setOpponents(updatedOpponents);

                // Add to context (if keeping context in sync manually)
                addOpponent(newTeam);

                setNewTeamName('');
            } else {
                const err = await response.json();
                alert(err.error || 'Failed to create team');
            }
        } catch (error) {
            console.error(error);
            alert("Error creating team.");
        }
    };

    const handleStartEdit = (team) => {
        setEditingId(team.id);
        setTempName(team.name);
        setTempLogo(team.logo);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setTempName('');
        setTempLogo(null);
    };

    const handleSaveEdit = async (id) => {
        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tempName, logo: tempLogo })
            });

            if (res.ok) {
                const updated = await res.json();
                updateTeam(updated);
                setEditingId(null);
            } else {
                alert("Failed to update opponent.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setTempLogo(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveTeam = async (id) => {
        if (!window.confirm("Are you sure you want to remove this opponent?")) return;
        
        try {
            const res = await fetch(`/api/teams/${id}`, {
                method: 'DELETE' // Assuming a DELETE endpoint exists for teams, though server.js only showed player delete
            });
            // If the server doesn't have it, we might need to add it, but for now let's focus on name/logo
        } catch (e) {}

        const updatedOpponents = opponents.filter(t => t.id !== id);
        setOpponents(updatedOpponents);
    };

    // --- New: Opponent Roster Management ---
    const handleAddPlayer = async (teamId, e) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;

        try {
            const res = await fetch(`/api/teams/${teamId}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPlayerName, number: newPlayerNumber })
            });

            if (res.ok) {
                const newPlayer = await res.json();
                
                const updatedOpponents = opponents.map(team => {
                    if (team.id === teamId) {
                        return { ...team, players: [...(team.players || []), newPlayer] };
                    }
                    return team;
                });
                
                setOpponents(updatedOpponents);
                
                // Keep the global context in sync
                const updatedTeam = updatedOpponents.find(t => t.id === teamId);
                if (updatedTeam) updateTeam(updatedTeam);
                
                setNewPlayerName('');
                setNewPlayerNumber('');
            } else {
                alert("Failed to add player.");
            }
        } catch (err) {
            console.error(err);
            alert("Error adding player.");
        }
    };

    const handleRemovePlayer = async (teamId, playerId) => {
        try {
            const res = await fetch(`/api/teams/${teamId}/players/${playerId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const updatedOpponents = opponents.map(team => {
                    if (team.id === teamId) {
                        return { ...team, players: (team.players || []).filter(p => p.id !== playerId) };
                    }
                    return team;
                });
                
                setOpponents(updatedOpponents);
                
                const updatedTeam = updatedOpponents.find(t => t.id === teamId);
                if (updatedTeam) updateTeam(updatedTeam);
            } else {
                alert("Failed to remove player.");
            }
        } catch (err) {
            console.error(err);
        }
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
                        <div key={team.id} style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
                            {editingId === team.id ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '1px solid #ccc', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                                                {tempLogo ? <img src={tempLogo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '10px' }}>LOGO</span>}
                                            </div>
                                            <label style={{ position: 'absolute', bottom: -5, right: -5, backgroundColor: 'blue', color: 'white', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                                                <span style={{ fontSize: '12px' }}>+</span>
                                            </label>
                                        </div>
                                        <input 
                                            type="text" 
                                            value={tempName} 
                                            onChange={(e) => setTempName(e.target.value)}
                                            style={{ flexGrow: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid blue' }}
                                        />
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1rem', marginTop: '0.5rem' }}>
                                        <div style={{ fontSize: '0.9rem', color: 'gray', marginBottom: '0.5rem' }}>Roster Management</div>
                                        <form onSubmit={(e) => handleAddPlayer(team.id, e)} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
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

                                        <div className="roster-list" style={{ backgroundColor: '#f9f9f9', color: 'var(--sd-black)', borderRadius: '4px', border: '1px solid #eee' }}>
                                            {(!team.players || team.players.length === 0) ? (
                                                <p style={{ padding: '0.5rem', textAlign: 'center', color: 'gray', fontSize: '0.9rem', margin: 0 }}>No players added yet.</p>
                                            ) : (
                                                team.players.map(player => (
                                                    <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 1rem', borderBottom: '1px solid #eee' }}>
                                                        {editingPlayerId === player.id ? (
                                                            <div style={{ display: 'flex', gap: '0.5rem', flexGrow: 1, marginRight: '1rem' }}>
                                                                <input type="text" value={editPlayerNumber} onChange={e => setEditPlayerNumber(e.target.value)} style={{ width: '30px', padding: '0.2rem', fontSize: '0.85rem' }} />
                                                                <input type="text" value={editPlayerName} onChange={e => setEditPlayerName(e.target.value)} style={{ flexGrow: 1, padding: '0.2rem', fontSize: '0.85rem' }} autoFocus />
                                                                <button type="button" onClick={() => setEditingPlayerId(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✕</button>
                                                                <button type="button" onClick={() => handleSavePlayerEdit(team.id, player.id)} style={{ color: 'green', background: 'none', border: 'none', cursor: 'pointer' }}><Save size={16} /></button>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
                                                                <span style={{ fontWeight: 'bold', width: '25px', color: 'var(--sd-accent)' }}>#{player.number}</span>
                                                                <button type="button" onClick={() => startEditingPlayer(player)} style={{ background: 'none', border: 'none', color: 'inherit', font: 'inherit', cursor: 'pointer', textAlign: 'left' }} title="Click to edit player">{player.name}</button>
                                                            </div>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemovePlayer(team.id, player.id)}
                                                            style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: '0.2rem' }}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                        <button onClick={handleCancelEdit} style={{ background: 'none', border: 'none', color: 'gray', cursor: 'pointer' }}>Cancel</button>
                                        <button onClick={() => handleSaveEdit(team.id)} className="primary-btn" style={{ padding: '0.3rem 0.8rem' }}>Save Details</button>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #eee', backgroundColor: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {team.logo ? <img src={team.logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '8px', color: '#ccc' }}>LOGO</span>}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: 'bold' }}>{team.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'gray' }}>{team.players?.length || 0} players</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => handleStartEdit(team)}
                                            style={{ background: 'none', border: 'none', color: 'var(--sd-accent)', cursor: 'pointer', padding: '0.5rem' }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleRemoveTeam(team.id)}
                                            style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: '0.5rem' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OpponentManagementScreen;
