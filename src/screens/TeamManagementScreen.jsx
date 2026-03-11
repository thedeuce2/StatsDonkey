import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { createPlayer } from '../models/types';
import { UserPlus, ArrowLeft, Save, Trash2 } from 'lucide-react';

const TeamManagementScreen = () => {
    const navigate = useNavigate();
    const { state, updateTeam } = useGame();

    const [myTeam, setMyTeam] = useState(state.myTeam);
    const [roster, setRoster] = useState(state.myTeam?.players || []);
    const [newPlayerName, setNewPlayerName] = useState('');
    const [newPlayerNumber, setNewPlayerNumber] = useState('');
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempTeamName, setTempTeamName] = useState(state.myTeam?.name || 'My Team');
    const [logoBase64, setLogoBase64] = useState(state.myTeam?.logo || null);

    // Sync local state when context loads from API
    React.useEffect(() => {
        setMyTeam(state.myTeam);
        setRoster(state.myTeam?.players || []);
        setTempTeamName(state.myTeam?.name || 'My Team');
        setLogoBase64(state.myTeam?.logo || null);
    }, [state.myTeam]);

    const handleSaveTeamSettings = async () => {
        if (!myTeam) return;
        
        try {
            const res = await fetch(`/api/teams/${myTeam.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: tempTeamName, logo: logoBase64 })
            });
            
            if (res.ok) {
                const updated = await res.json();
                updateTeam(updated);
                setIsEditingName(false);
            } else {
                alert("Failed to save team settings.");
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
            setLogoBase64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleAddPlayer = async (e) => {
        e.preventDefault();
        if (!newPlayerName.trim()) return;

        let activeTeam = myTeam;

        // Auto-create "My Team" if it doesn't exist yet in the DB
        if (!activeTeam) {
            try {
                const res = await fetch('/api/teams', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        name: tempTeamName, 
                        isUserTeam: true, 
                        color: 'var(--sd-baby-blue)',
                        logo: logoBase64
                    })
                });
                if (res.ok) {
                    activeTeam = await res.json();
                    setMyTeam(activeTeam);
                    updateTeam(activeTeam);
                } else {
                    alert("Failed to create base team.");
                    return;
                }
            } catch (err) {
                console.error(err);
                return;
            }
        }

        // Add player to backend
        try {
            const res = await fetch(`/api/teams/${activeTeam.id}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newPlayerName, number: newPlayerNumber })
            });

            if (res.ok) {
                const newPlayer = await res.json();
                const updatedRoster = [...roster, newPlayer];
                setRoster(updatedRoster);
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

    const handleRemovePlayer = async (id) => {
        if (!myTeam) return;

        try {
            const res = await fetch(`/api/teams/${myTeam.id}/players/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                const updatedRoster = roster.filter(p => p.id !== id);
                setRoster(updatedRoster);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="screen-container" style={{ width: '100%', maxWidth: '600px', padding: '1rem' }}>
            <header style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem', gap: '1rem' }}>
                <button className="icon-btn" onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                    <ArrowLeft size={24} />
                </button>
                
                <div style={{ position: 'relative', width: '60px', height: '60px', flexShrink: 0 }}>
                    <div style={{ 
                        width: '100%', 
                        height: '100%', 
                        borderRadius: '50%', 
                        overflow: 'hidden', 
                        border: '2px solid var(--sd-accent)',
                        backgroundColor: '#eee',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {logoBase64 ? (
                            <img src={logoBase64} alt="Team Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontSize: '0.7rem', color: '#999' }}>LOGO</span>
                        )}
                    </div>
                    <label style={{ 
                        position: 'absolute', 
                        bottom: '-5px', 
                        right: '-5px', 
                        backgroundColor: 'var(--sd-accent)', 
                        color: 'white', 
                        borderRadius: '50%', 
                        width: '24px', 
                        height: '24px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
                        <span style={{ fontSize: '12px' }}>+</span>
                    </label>
                </div>

                <div style={{ flexGrow: 1 }}>
                    {isEditingName ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input 
                                type="text" 
                                value={tempTeamName} 
                                onChange={(e) => setTempTeamName(e.target.value)}
                                style={{ flexGrow: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid var(--sd-accent)' }}
                                autoFocus
                            />
                            <button onClick={handleSaveTeamSettings} className="icon-btn" style={{ color: 'green' }}>
                                <Save size={20} />
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <h2 style={{ margin: 0 }}>{myTeam?.name || 'My Team'}</h2>
                            <button onClick={() => setIsEditingName(true)} style={{ background: 'none', border: 'none', color: 'var(--sd-accent)', cursor: 'pointer', fontSize: '0.8rem' }}>
                                Edit
                            </button>
                        </div>
                    )}
                    <div style={{ fontSize: '0.9rem', color: 'gray' }}>Roster Management</div>
                </div>

                {(logoBase64 !== state.myTeam?.logo) && !isEditingName && (
                    <button onClick={handleSaveTeamSettings} className="primary-btn" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                        Save Logo
                    </button>
                )}
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
