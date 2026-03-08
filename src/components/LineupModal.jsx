import React, { useState, useEffect } from 'react';

const POSITIONS = ['-', 'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LC', 'RC', 'RF', 'EH'];

const LineupModal = ({ isOpen, onClose, initialAway, initialHome, onSave }) => {
    const [awayLineup, setAwayLineup] = useState([]);
    const [homeLineup, setHomeLineup] = useState([]);
    const [activeTab, setActiveTab] = useState('away');

    useEffect(() => {
        // Ensure at least 10 spots are available, handling either string or object format from old versions
        const initList = (list) => {
            const arr = (list || []).map(p => {
                if (typeof p === 'string') return { name: p, position: '-' };
                return { name: p.name || '', position: p.position || '-' };
            });
            while (arr.length < 12) arr.push({ name: '', position: '-' });
            return arr;
        };
        setAwayLineup(initList(initialAway));
        setHomeLineup(initList(initialHome));
    }, [initialAway, initialHome, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        // Filter out completely empty rows by name
        const cleanAway = awayLineup.filter(p => p.name.trim() !== '');
        const cleanHome = homeLineup.filter(p => p.name.trim() !== '');
        onSave(cleanAway, cleanHome);
        onClose();
    };

    const updatePlayer = (team, index, field, value) => {
        if (team === 'away') {
            const copy = [...awayLineup];
            copy[index] = { ...copy[index], [field]: value };
            setAwayLineup(copy);
        } else {
            const copy = [...homeLineup];
            copy[index] = { ...copy[index], [field]: value };
            setHomeLineup(copy);
        }
    };

    const addRow = (team) => {
        if (team === 'away') setAwayLineup([...awayLineup, { name: '', position: '-' }]);
        else setHomeLineup([...homeLineup, { name: '', position: '-' }]);
    };

    const activeLineup = activeTab === 'away' ? awayLineup : homeLineup;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--sd-beige)', width: '90%', maxWidth: '400px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

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
                    {activeLineup.map((player, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem' }}>
                            <span style={{ width: '25px', fontWeight: 'bold', color: 'gray' }}>{idx + 1}.</span>
                            <input
                                type="text"
                                value={player.name}
                                onChange={(e) => updatePlayer(activeTab, idx, 'name', e.target.value)}
                                placeholder={`Batter ${idx + 1}`}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
                            <select
                                value={player.position}
                                onChange={(e) => updatePlayer(activeTab, idx, 'position', e.target.value)}
                                style={{ width: '70px', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black' }}
                            >
                                {POSITIONS.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <button
                        onClick={() => addRow(activeTab)}
                        style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', background: '#eee', border: '1px dashed #aaa', cursor: 'pointer' }}>
                        + Add Batter
                    </button>
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#ddd' }}>
                    <button onClick={handleSave} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--sd-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Save Lineups
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LineupModal;
