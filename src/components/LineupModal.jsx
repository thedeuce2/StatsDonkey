import React, { useState, useEffect } from 'react';

const POSITIONS = ['-', 'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LC', 'RC', 'RF', 'EH'];

const LineupModal = ({ isOpen, onClose, initialAway, initialHome, awayTeam, homeTeam, onSave }) => {
    const [awayLineup, setAwayLineup] = useState([]);
    const [homeLineup, setHomeLineup] = useState([]);
    const [activeTab, setActiveTab] = useState('away');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const initList = (list, teamObj) => {
            const roster = teamObj?.players || [];
            const arr = (list || []).map(p => {
                let name = '';
                let position = '-';
                if (typeof p === 'string') name = p;
                else {
                    name = p.name || '';
                    position = p.position || '-';
                }
                // If it has a name but isn't in the roster, treat it as a custom player input
                const isCustom = name !== '' && !roster.some(r => r.name === name);
                return { name, position, isCustom };
            });
            while (arr.length < 12) arr.push({ name: '', position: '-', isCustom: false });
            return arr;
        };
        
        setAwayLineup(initList(initialAway, awayTeam));
        setHomeLineup(initList(initialHome, homeTeam));
    }, [initialAway, initialHome, awayTeam, homeTeam, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        
        // Helper to save new custom players directly to the database roster
        const processNewPlayers = async (lineup, teamObj) => {
            if (!teamObj || !teamObj.id) return;
            const rosterItems = teamObj.players || [];
            
            for (const p of lineup) {
                if (p.name.trim() !== '' && p.isCustom) {
                    const typedName = p.name.trim();
                    // Double check it's strictly not already in the roster before firing
                    if (!rosterItems.some(r => r.name.toLowerCase() === typedName.toLowerCase())) {
                        try {
                            await fetch(`/api/teams/${teamObj.id}/players`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ name: typedName })
                            });
                        } catch(err) {
                            console.error('Failed to save new custom player to DB:', typedName, err);
                        }
                    }
                }
            }
        };

        if (awayTeam) await processNewPlayers(awayLineup, awayTeam);
        if (homeTeam) await processNewPlayers(homeLineup, homeTeam);

        // Filter out completely empty rows and map back to expected format
        const cleanAway = awayLineup.filter(p => p.name.trim() !== '').map(p => ({ name: p.name.trim(), position: p.position }));
        const cleanHome = homeLineup.filter(p => p.name.trim() !== '').map(p => ({ name: p.name.trim(), position: p.position }));
        
        setIsSaving(false);
        onSave(cleanAway, cleanHome);
        onClose();
    };

    const updatePlayerFull = (team, index, updates) => {
        if (team === 'away') {
            const copy = [...awayLineup];
            copy[index] = { ...copy[index], ...updates };
            setAwayLineup(copy);
        } else {
            const copy = [...homeLineup];
            copy[index] = { ...copy[index], ...updates };
            setHomeLineup(copy);
        }
    };

    const addRow = (team) => {
        if (team === 'away') setAwayLineup([...awayLineup, { name: '', position: '-', isCustom: false }]);
        else setHomeLineup([...homeLineup, { name: '', position: '-', isCustom: false }]);
    };

    const activeLineup = activeTab === 'away' ? awayLineup : homeLineup;
    const activeTeamObj = activeTab === 'away' ? awayTeam : homeTeam;
    const activeRoster = activeTeamObj?.players || [];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--sd-beige)', width: '90%', maxWidth: '450px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-dark-gray)', color: 'var(--sd-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Lineups & Positions</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ display: 'flex', backgroundColor: '#ddd' }}>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', backgroundColor: activeTab === 'away' ? 'var(--sd-white)' : 'transparent', fontWeight: activeTab === 'away' ? 'bold' : 'normal' }}
                        onClick={() => setActiveTab('away')}
                    >Away Team</button>
                    <button
                        style={{ flex: 1, padding: '0.75rem', border: 'none', backgroundColor: activeTab === 'home' ? 'var(--sd-white)' : 'transparent', fontWeight: activeTab === 'home' ? 'bold' : 'normal' }}
                        onClick={() => setActiveTab('home')}
                    >Home Team</button>
                </div>

                <div style={{ flexGrow: 1, overflowY: 'auto', padding: '1rem', backgroundColor: 'var(--sd-white)' }}>
                    {activeLineup.map((player, idx) => {
                        // Check if the current player name actually exists in the dropdown list
                        const matchedRosterName = activeRoster.find(r => r.name === player.name)?.name || '';
                        const dropdownValue = player.isCustom ? 'NEW' : matchedRosterName;

                        return (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                                <span style={{ width: '25px', fontWeight: 'bold', color: 'gray' }}>{idx + 1}.</span>
                                
                                {!player.isCustom ? (
                                    <select
                                        value={dropdownValue}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            if (val === 'NEW') {
                                                updatePlayerFull(activeTab, idx, { isCustom: true, name: '' });
                                            } else {
                                                updatePlayerFull(activeTab, idx, { isCustom: false, name: val });
                                            }
                                        }}
                                        style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black' }}
                                    >
                                        <option value="" disabled>Select Player...</option>
                                        {activeRoster.map(r => (
                                            <option key={r.id} value={r.name}>{r.number ? `#${r.number} ` : ''}{r.name}</option>
                                        ))}
                                        {activeRoster.length === 0 && <option value="" disabled>No players on roster</option>}
                                        <option value="NEW">+ Custom / Add New Player</option>
                                    </select>
                                ) : (
                                    <div style={{ flex: 1, display: 'flex', gap: '0.2rem' }}>
                                        <input
                                            type="text"
                                            value={player.name}
                                            onChange={(e) => updatePlayerFull(activeTab, idx, { name: e.target.value })}
                                            placeholder={`New Batter ${idx + 1}`}
                                            style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                                            autoFocus
                                        />
                                        <button 
                                            onClick={() => updatePlayerFull(activeTab, idx, { isCustom: false, name: '' })}
                                            style={{ padding: '0.4rem 0.6rem', background: '#ccc', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                                            title="Cancel custom input"
                                        >✕</button>
                                    </div>
                                )}

                                <select
                                    value={player.position}
                                    onChange={(e) => updatePlayerFull(activeTab, idx, { position: e.target.value })}
                                    style={{ width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black' }}
                                >
                                    {POSITIONS.map(pos => (
                                        <option key={pos} value={pos}>{pos}</option>
                                    ))}
                                </select>
                            </div>
                        );
                    })}
                    <button
                        onClick={() => addRow(activeTab)}
                        style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', background: '#eee', border: '1px dashed #aaa', cursor: 'pointer' }}>
                        + Add Batter Slot
                    </button>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#ddd' }}>
                    <button 
                        onClick={handleSave} 
                        disabled={isSaving}
                        style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--sd-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.7 : 1 }}
                    >
                        {isSaving ? 'Saving...' : 'Save Lineups'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LineupModal;
