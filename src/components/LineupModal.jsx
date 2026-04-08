import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

const POSITIONS = ['-', 'P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LC', 'RC', 'RF', 'EH'];

const LineupModal = ({ isOpen, onClose, initialAway, initialHome, initialAwayBench, initialHomeBench, awayTeam, homeTeam, onSave }) => {
    const [awayLineup, setAwayLineup] = useState([]);
    const [homeLineup, setHomeLineup] = useState([]);
    const [awayBench, setAwayBench] = useState([]);
    const [homeBench, setHomeBench] = useState([]);
    const [activeTab, setActiveTab] = useState('away');
    const [isSaving, setIsSaving] = useState(false);
    const { state, recordPlay, undoPlay, updateLineups, getBatterGameStats, substitutePlayer } = useGame();
    const game = state.currentGame;
    const isMidGame = game && game.events.length > 0;

    const [subSelectingIndex, setSubSelectingIndex] = useState(null); // { idx, listType }

    useEffect(() => {
        const initList = (list, teamObj, minSize = 12) => {
            const roster = teamObj?.players || [];
            const arr = (list || []).map(p => {
                let name = '';
                let position = '-';
                if (typeof p === 'string') name = p;
                else {
                    name = p.name || '';
                    position = p.position || '-';
                }
                const isCustom = name !== '' && !roster.some(r => r.name === name);
                return { name, position, isCustom };
            });
            while (arr.length < minSize) arr.push({ name: '', position: '-', isCustom: false });
            return arr;
        };
        
        setAwayLineup(initList(initialAway, awayTeam, 12));
        setHomeLineup(initList(initialHome, homeTeam, 12));
        setAwayBench(initList(initialAwayBench, awayTeam, 5));
        setHomeBench(initList(initialHomeBench, homeTeam, 5));
    }, [initialAway, initialHome, initialAwayBench, initialHomeBench, awayTeam, homeTeam, isOpen]);

    if (!isOpen) return null;

    const handleSub = (targetIdx, benchIdx) => {
        const team = activeTab;
        const targetLineup = team === 'away' ? awayLineup : homeLineup;
        const targetBench = team === 'away' ? awayBench : homeBench;

        const oldPlayer = targetLineup[targetIdx];
        const newPlayer = targetBench[benchIdx];

        if (!oldPlayer.name || !newPlayer.name) return;

        // If mid-game, record as official sub action
        if (isMidGame) {
            substitutePlayer(team, oldPlayer.name, newPlayer.name);
        }

        // Always update local UI state too
        const newUserLineup = [...targetLineup];
        const newUserBench = [...targetBench];

        newUserLineup[targetIdx] = { ...newPlayer };
        newUserBench[benchIdx] = { ...oldPlayer };

        if (team === 'away') {
            setAwayLineup(newUserLineup);
            setAwayBench(newUserBench);
        } else {
            setHomeLineup(newUserLineup);
            setHomeBench(newUserBench);
        }
        setSubSelectingIndex(null);
    };

    const handleSave = async () => {
        setIsSaving(true);
        
        // Helper to save new custom players directly to the database roster
        const processNewPlayers = async (lineup, bench, teamObj) => {
            if (!teamObj || !teamObj.id) return;
            const rosterItems = teamObj.players || [];
            const fullList = [...lineup, ...bench];
            
            for (const p of fullList) {
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

        if (awayTeam) await processNewPlayers(awayLineup, awayBench, awayTeam);
        if (homeTeam) await processNewPlayers(homeLineup, homeBench, homeTeam);

        // Validation Helper
        const validateLineup = (lineup, bench, teamName) => {
            const names = new Set();
            const positions = new Set();
            const fullList = [...lineup, ...bench];
            
            for (const p of fullList) {
                const name = p.name.trim().toLowerCase();
                const pos = p.position;
                if (!name) continue; // Skip empty rows

                if (names.has(name)) {
                    alert(`Validation Error (${teamName}): Player "${p.name.trim()}" is listed multiple times.`);
                    return false;
                }
                names.add(name);
            }

            // Secondary loop for position validation specifically for Starters
            for (const p of lineup) {
                const pos = p.position;
                if (pos !== '-' && pos !== 'EH') {
                    if (positions.has(pos)) {
                        alert(`Validation Error (${teamName}): Multiple starters assigned to fielding position "${pos}".`);
                        return false;
                    }
                    positions.add(pos);
                }
            }
            return true;
        };

        if (!validateLineup(awayLineup, awayBench, "Away Focus") || !validateLineup(homeLineup, homeBench, "Home Focus")) {
            setIsSaving(false);
            return; // Abort save due to validation failure
        }

        // Filter out completely empty rows and map back to expected format
        const cleanAway = awayLineup.filter(p => p.name.trim() !== '').map(p => ({ name: p.name.trim(), position: p.position }));
        const cleanHome = homeLineup.filter(p => p.name.trim() !== '').map(p => ({ name: p.name.trim(), position: p.position }));
        
        const cleanAwayBench = awayBench.filter(p => p.name.trim() !== '').map(p => ({ name: p.name.trim(), position: p.position }));
        const cleanHomeBench = homeBench.filter(p => p.name.trim() !== '').map(p => ({ name: p.name.trim(), position: p.position }));

        setIsSaving(false);
        onSave(cleanAway, cleanHome, cleanAwayBench, cleanHomeBench);
        onClose();
    };

    const updatePlayerFull = (team, listType, index, updates) => {
        const isAway = team === 'away';
        const isBench = listType === 'bench';
        
        if (isAway) {
            if (isBench) {
                const copy = [...awayBench];
                copy[index] = { ...copy[index], ...updates };
                setAwayBench(copy);
            } else {
                const copy = [...awayLineup];
                copy[index] = { ...copy[index], ...updates };
                setAwayLineup(copy);
            }
        } else {
            if (isBench) {
                const copy = [...homeBench];
                copy[index] = { ...copy[index], ...updates };
                setHomeBench(copy);
            } else {
                const copy = [...homeLineup];
                copy[index] = { ...copy[index], ...updates };
                setHomeLineup(copy);
            }
        }
    };

    const moveRow = (team, listType, idx, direction) => {
        const isAway = team === 'away';
        const isBench = listType === 'bench';
        const list = isAway ? (isBench ? [...awayBench] : [...awayLineup]) : (isBench ? [...homeBench] : [...homeLineup]);
        
        if (direction === 'up' && idx > 0) {
            [list[idx - 1], list[idx]] = [list[idx], list[idx - 1]];
        } else if (direction === 'down' && idx < list.length - 1) {
            [list[idx + 1], list[idx]] = [list[idx], list[idx + 1]];
        } else {
            return;
        }
        
        if (isAway) {
            if (isBench) setAwayBench(list);
            else setAwayLineup(list);
        } else {
            if (isBench) setHomeBench(list);
            else setHomeLineup(list);
        }
    };

    const addRow = (team, listType) => {
        const newItem = { name: '', position: '-', isCustom: false };
        if (team === 'away') {
            if (listType === 'bench') setAwayBench([...awayBench, newItem]);
            else setAwayLineup([...awayLineup, newItem]);
        } else {
            if (listType === 'bench') setHomeBench([...homeBench, newItem]);
            else setHomeLineup([...homeLineup, newItem]);
        }
    };

    const activeLineup = activeTab === 'away' ? awayLineup : homeLineup;
    const activeBench = activeTab === 'away' ? awayBench : homeBench;
    const activeTeamObj = activeTab === 'away' ? awayTeam : homeTeam;
    const activeRoster = activeTeamObj?.players || [];

    const PlayerRow = ({ player, idx, listType }) => {
        const matchedRosterName = activeRoster.find(r => r.name === player.name)?.name || '';
        const dropdownValue = player.isCustom ? 'NEW' : matchedRosterName;
        const isBeingSubbed = subSelectingIndex?.idx === idx && subSelectingIndex?.listType === listType;

        return (
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem', gap: '0.5rem', position: 'relative' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginRight: '4px' }}>
                    <button onClick={() => moveRow(activeTab, listType, idx, 'up')} disabled={idx === 0} style={{ padding: '0 4px', fontSize: '0.5rem', border: 'none', background: idx === 0 ? 'transparent' : '#eee', color: '#666', cursor: idx === 0 ? 'default' : 'pointer' }}>▲</button>
                    <button onClick={() => moveRow(activeTab, listType, idx, 'down')} disabled={idx === (listType === 'starter' ? activeLineup.length - 1 : activeBench.length - 1)} style={{ padding: '0 4px', fontSize: '0.5rem', border: 'none', background: idx === (listType === 'starter' ? activeLineup.length - 1 : activeBench.length - 1) ? 'transparent' : '#eee', color: '#666', cursor: 'pointer' }}>▼</button>
                </div>
                <span style={{ width: '25px', fontWeight: 'bold', color: 'gray' }}>{listType === 'starter' ? idx + 1 : 'B'}</span>
                
                {!player.isCustom ? (
                    <select
                        value={dropdownValue}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'NEW') {
                                updatePlayerFull(activeTab, listType, idx, { isCustom: true, name: '' });
                            } else {
                                updatePlayerFull(activeTab, listType, idx, { isCustom: false, name: val });
                            }
                        }}
                        style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black' }}
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
                            onChange={(e) => updatePlayerFull(activeTab, listType, idx, { name: e.target.value })}
                            placeholder={`New Batter ${idx + 1}`}
                            style={{ flex: 1, padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', width: '100%' }}
                            autoFocus
                        />
                        <button 
                            onClick={() => updatePlayerFull(activeTab, listType, idx, { isCustom: false, name: '' })}
                            style={{ padding: '0.4rem 0.6rem', background: '#ccc', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                            title="Cancel custom input"
                        >✕</button>
                    </div>
                )}

                {listType === 'starter' && player.name && (
                    <button 
                        onClick={() => setSubSelectingIndex(isBeingSubbed ? null : { idx, listType })}
                        style={{ padding: '0.4rem', background: isBeingSubbed ? 'var(--sd-accent)' : '#eee', color: isBeingSubbed ? 'white' : 'black', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 'bold' }}
                    >
                        SUB
                    </button>
                )}

                <select
                    value={player.position}
                    onChange={(e) => updatePlayerFull(activeTab, listType, idx, { position: e.target.value })}
                    style={{ width: '60px', padding: '0.4rem', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: 'white', color: 'black', fontSize: '0.8rem' }}
                >
                    {POSITIONS.map(pos => (
                        <option key={pos} value={pos}>{pos}</option>
                    ))}
                </select>

                {isBeingSubbed && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', border: '2px solid var(--sd-accent)', borderRadius: '8px', zIndex: 100, padding: '0.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#666' }}>Sub in from bench:</div>
                        {activeBench.filter(p => p.name).length === 0 && <div style={{ fontSize: '0.8rem', color: '#999' }}>No bench players available.</div>}
                        {activeBench.map((bp, bidx) => (
                            bp.name ? (
                                <button
                                    key={`sub-${bidx}`}
                                    onClick={() => handleSub(idx, bidx)}
                                    style={{ width: '100%', textAlign: 'left', padding: '0.5rem', marginBottom: '0.2rem', background: '#f8f9fa', border: '1px solid #eee', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}
                                >
                                    {bp.name}
                                </button>
                            ) : null
                        ))}
                    </div>
                )}
            </div>
        );
    };

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
                    <h4 style={{ marginTop: 0, color: 'var(--sd-accent)', borderBottom: '1px solid #eee', paddingBottom: '0.3rem' }}>Starting Lineup</h4>
                    {activeLineup.map((player, idx) => (
                        <PlayerRow key={`starter-${idx}`} player={player} idx={idx} listType="starter" />
                    ))}
                    <button
                        onClick={() => addRow(activeTab, 'starter')}
                        style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', background: '#eee', border: '1px dashed #aaa', cursor: 'pointer', marginBottom: '1.5rem' }}>
                        + Add Batter Slot
                    </button>

                    <h4 style={{ color: 'var(--sd-accent)', borderBottom: '1px solid #eee', paddingBottom: '0.3rem' }}>Dugout / Bench</h4>
                    {activeBench.map((player, idx) => (
                        <PlayerRow key={`bench-${idx}`} player={player} idx={idx} listType="bench" />
                    ))}
                    <button
                        onClick={() => addRow(activeTab, 'bench')}
                        style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem', background: '#eee', border: '1px dashed #aaa', cursor: 'pointer' }}>
                        + Add Bench Slot
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
