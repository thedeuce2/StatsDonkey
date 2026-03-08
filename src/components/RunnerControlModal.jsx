import React, { useState, useEffect } from 'react';

const RunnerControlModal = ({ isOpen, onClose, hitType, isOutTrigger, bases, currentBatterName, onConfirm }) => {
    // We determine what explicitly happened to everyone.
    // Destinations: '1B', '2B', '3B', 'HOME', 'OUT', 'REMAIN'
    const [destinations, setDestinations] = useState({
        batter: isOutTrigger ? 'OUT' : (hitType || '1B'),
        first: bases.first ? 'REMAIN' : null,
        second: bases.second ? 'REMAIN' : null,
        third: bases.third ? 'REMAIN' : null,
    });

    // Auto-predict based on hit type if not an out trigger
    useEffect(() => {
        if (!isOpen) return;

        let defDest = { ...destinations };

        if (isOutTrigger) {
            defDest.batter = 'OUT';
        } else if (hitType === '1B') {
            defDest.batter = '1B';
            if (bases.first) defDest.first = '2B';
            if (bases.second) defDest.second = '3B';
            if (bases.third) defDest.third = 'HOME';
        } else if (hitType === '2B') {
            defDest.batter = '2B';
            if (bases.first) defDest.first = '3B';
            if (bases.second) defDest.second = 'HOME';
            if (bases.third) defDest.third = 'HOME';
        } else if (hitType === '3B') {
            defDest.batter = '3B';
            if (bases.first) defDest.first = 'HOME';
            if (bases.second) defDest.second = 'HOME';
            if (bases.third) defDest.third = 'HOME';
        } else if (hitType === 'HR') {
            defDest.batter = 'HOME';
            if (bases.first) defDest.first = 'HOME';
            if (bases.second) defDest.second = 'HOME';
            if (bases.third) defDest.third = 'HOME';
        }

        setDestinations(defDest);
    }, [isOpen, hitType, isOutTrigger, bases]);

    if (!isOpen) return null;

    const handleConfirm = () => {
        let runsScored = 0;
        let outsRecorded = 0;

        // Count runs and outs
        Object.values(destinations).forEach(dest => {
            if (dest === 'HOME') runsScored++;
            if (dest === 'OUT') outsRecorded++;
        });

        // Determine new bases state
        const newBases = { first: false, second: false, third: false };

        // Helper to place runner on base (if multiple end up on same base, we just visually show it occupied)
        const placeOnBase = (runnerName, dest) => {
            if (dest === '1B') newBases.first = runnerName || true;
            if (dest === '2B') newBases.second = runnerName || true;
            if (dest === '3B') newBases.third = runnerName || true;
        };

        // If they 'REMAIN', they stay where they were
        if (bases.third && destinations.third) {
            placeOnBase(bases.third, destinations.third === 'REMAIN' ? '3B' : destinations.third);
        }
        if (bases.second && destinations.second) {
            placeOnBase(bases.second, destinations.second === 'REMAIN' ? '2B' : destinations.second);
        }
        if (bases.first && destinations.first) {
            placeOnBase(bases.first, destinations.first === 'REMAIN' ? '1B' : destinations.first);
        }
        // Place Batter
        if (destinations.batter && destinations.batter !== 'OUT' && destinations.batter !== 'HOME') {
            placeOnBase(currentBatterName || 'Batter', destinations.batter);
        }

        onConfirm({
            runsScored,
            outsRecorded,
            newBases,
            hitType,
            isOutTrigger
        });
        onClose();
    };

    const SelectRow = ({ label, runnerName, field, options }) => {
        if (!destinations[field] && runnerName !== true && !runnerName) return null; // not on base

        const displayName = (typeof runnerName === 'string' && runnerName !== '') ? runnerName : label;

        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #ddd' }}>
                <div style={{ fontWeight: 'bold' }}>{displayName}</div>
                <select
                    value={destinations[field]}
                    onChange={e => setDestinations({ ...destinations, [field]: e.target.value })}
                    style={{ padding: '0.5rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid gray', backgroundColor: 'white', color: 'black' }}
                >
                    {options.map(opt => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                </select>
            </div>
        );
    };

    const batterOptions = [
        { val: 'OUT', label: 'Out' },
        { val: '1B', label: '1st Base' },
        { val: '2B', label: '2nd Base' },
        { val: '3B', label: '3rd Base' },
        { val: 'HOME', label: 'Home (Score)' }
    ];

    const runnerOptions = [
        { val: 'REMAIN', label: 'Hold Base' },
        { val: 'OUT', label: 'Out' },
        { val: '1B', label: '1st Base' },
        { val: '2B', label: '2nd Base' },
        { val: '3B', label: '3rd Base' },
        { val: 'HOME', label: 'Home (Score)' }
    ];

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--sd-beige)', width: '90%', maxWidth: '400px', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-dark-gray)', color: 'var(--sd-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>Resolve {hitType || (isOutTrigger ? 'Out' : 'Play')}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-white)', flexGrow: 1 }}>
                    <p style={{ marginTop: 0, color: 'gray', fontSize: '0.9rem' }}>Where does everyone end up?</p>

                    <SelectRow label="Batter" runnerName={currentBatterName} field="batter" options={batterOptions} />
                    {bases.third && <SelectRow label="Runner on 3rd" runnerName={bases.third} field="third" options={runnerOptions} />}
                    {bases.second && <SelectRow label="Runner on 2nd" runnerName={bases.second} field="second" options={runnerOptions} />}
                    {bases.first && <SelectRow label="Runner on 1st" runnerName={bases.first} field="first" options={runnerOptions} />}
                </div>

                <div style={{ padding: '1rem', backgroundColor: '#ddd' }}>
                    <button onClick={handleConfirm} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--sd-accent)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                        Confirm Play
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RunnerControlModal;
