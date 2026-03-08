import React, { useState, useEffect } from 'react';

const LineupModal = ({ isOpen, onClose, initialAway, initialHome, onSave }) => {
    const [awayLineup, setAwayLineup] = useState([]);
    const [homeLineup, setHomeLineup] = useState([]);
    const [activeTab, setActiveTab] = useState('away');

    useEffect(() => {
        // Ensure at least 10 spots are available
        const initList = (list) => {
            const arr = [...(list || [])];
            while (arr.length < 12) arr.push('');
            return arr;
        };
        setAwayLineup(initList(initialAway));
        setHomeLineup(initList(initialHome));
    }, [initialAway, initialHome, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        // Filter out completely empty rows, but preserve empty strings if there are gaps?
        // Let's just strip trailing empties to allow the user to have less than 12 if they want, 
        // or we just filter all empty strings.
        const cleanAway = awayLineup.filter(n => n.trim() !== '');
        const cleanHome = homeLineup.filter(n => n.trim() !== '');
        onSave(cleanAway, cleanHome);
        onClose();
    };

    const updatePlayer = (team, index, value) => {
        if (team === 'away') {
            const copy = [...awayLineup];
            copy[index] = value;
            setAwayLineup(copy);
        } else {
            const copy = [...homeLineup];
            copy[index] = value;
            setHomeLineup(copy);
        }
    };

    const addRow = (team) => {
        if (team === 'away') setAwayLineup([...awayLineup, '']);
        else setHomeLineup([...homeLineup, '']);
    };

    const activeLineup = activeTab === 'away' ? awayLineup : homeLineup;

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--sd-beige)', width: '90%', maxWidth: '400px', maxHeight: '90vh', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-dark-gray)', color: 'var(--sd-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Lineups</h3>
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
                    {activeLineup.map((name, idx) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                            <span style={{ width: '30px', fontWeight: 'bold', color: 'gray' }}>{idx + 1}.</span>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => updatePlayer(activeTab, idx, e.target.value)}
                                placeholder={`Batter ${idx + 1}`}
                                style={{ flex: 1, padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
                            />
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
