import React, { useState } from 'react';

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LC', 'RC', 'RF', 'EH'];
const HIT_TYPES = [
    { id: 'FLY_BALL', label: 'Fly Ball' },
    { id: 'GROUND_BALL', label: 'Grounder' },
    { id: 'LINE_DRIVE', label: 'Line Drive' },
    { id: 'POP_UP', label: 'Pop Up' }
];
const CONTACT_QUALITIES = [
    { id: 'SOFT', label: 'Soft' },
    { id: 'AVERAGE', label: 'Avg' },
    { id: 'HARD', label: 'Hard' }
];

const HitOutcomeModal = ({ isOpen, onClose, onSelectOutcome, clickLocation }) => {
    const [isSelectingError, setIsSelectingError] = useState(false);
    const [errorFielder, setErrorFielder] = useState('SS');
    const [errorType, setErrorType] = useState('Fielding');
    
    // New hit detail states
    const [selectedHitType, setSelectedHitType] = useState('LINE_DRIVE');
    const [selectedQuality, setSelectedQuality] = useState('AVERAGE');

    if (!isOpen) return null;

    const handleClose = () => {
        setIsSelectingError(false);
        onClose();
    };

    const handleSelectOutcome = (outcomeBase) => {
        onSelectOutcome({
            ...outcomeBase,
            hitTypeDetail: selectedHitType,
            contactQuality: selectedQuality
        });
        setIsSelectingError(false);
    };

    const submitError = () => {
        onSelectOutcome({ 
            hitType: 'ROE', 
            errorDetail: { fielder: errorFielder, type: errorType },
            hitTypeDetail: selectedHitType,
            contactQuality: selectedQuality
        });
        setIsSelectingError(false);
    };

    const btnStyle = {
        padding: '0.8rem',
        fontSize: '1rem',
        fontWeight: 'bold',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        color: 'white',
        width: '100%',
        transition: 'transform 0.1s active'
    };

    const detailBtnStyle = (isSelected, color) => ({
        padding: '0.4rem 0.6rem',
        fontSize: '0.75rem',
        borderRadius: '4px',
        border: isSelected ? `2px solid ${color}` : '2px solid transparent',
        backgroundColor: isSelected ? `${color}22` : '#eee',
        color: isSelected ? color : '#666',
        fontWeight: 'bold',
        cursor: 'pointer',
        flex: 1,
        textAlign: 'center'
    });

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem' }}>
            <div style={{ backgroundColor: '#fff', width: '100%', maxWidth: '380px', borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}>

                <div style={{ padding: '0.8rem 1rem', backgroundColor: '#111', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        {isSelectingError ? 'Error Details' : 'Record Outcome'}
                    </h3>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.4rem', cursor: 'pointer', padding: '0 0.5rem' }}>✕</button>
                </div>

                <div style={{ padding: '1.2rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Hit Details Row (Always visible unless in error sub-menu) */}
                    {!isSelectingError && (
                        <div style={{ backgroundColor: '#f0f4f8', padding: '0.8rem', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Hit Type</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {HIT_TYPES.map(ht => (
                                        <button 
                                            key={ht.id} 
                                            onClick={() => setSelectedHitType(ht.id)}
                                            style={detailBtnStyle(selectedHitType === ht.id, 'var(--sd-accent)')}
                                        >
                                            {ht.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                <label style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#888', textTransform: 'uppercase' }}>Contact</label>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                    {CONTACT_QUALITIES.map(cq => (
                                        <button 
                                            key={cq.id} 
                                            onClick={() => setSelectedQuality(cq.id)}
                                            style={detailBtnStyle(selectedQuality === cq.id, '#ff9900')}
                                        >
                                            {cq.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {isSelectingError ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Who made the error?</label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                                    {POSITIONS.map(pos => (
                                        <button 
                                            key={pos} 
                                            onClick={() => setErrorFielder(pos)}
                                            style={{ padding: '0.5rem', fontSize: '0.8rem', borderRadius: '4px', border: errorFielder === pos ? '2px solid var(--sd-accent)' : '1px solid #ddd', background: errorFielder === pos ? '#eef' : 'white', fontWeight: errorFielder === pos ? 'bold' : 'normal' }}
                                        >
                                            {pos}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Error Type?</label>
                                <select
                                    value={errorType}
                                    onChange={(e) => setErrorType(e.target.value)}
                                    style={{ padding: '0.75rem', fontSize: '1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Fielding">Fielding Error</option>
                                    <option value="Throwing">Throwing Error</option>
                                    <option value="Dropped Catch">Dropped Catch</option>
                                </select>
                            </div>

                            <button
                                style={{ ...btnStyle, backgroundColor: 'var(--sd-accent)', marginTop: '1rem' }}
                                onClick={submitError}
                            >
                                CONFIRM ROE
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#eee', color: '#666', boxShadow: 'none' }}
                                onClick={() => setIsSelectingError(false)}
                            >
                                BACK
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                <button style={{ ...btnStyle, backgroundColor: '#d9534f' }} onClick={() => handleSelectOutcome({ isOutTrigger: true, type: 'OUT' })}>FLY OUT</button>
                                <button style={{ ...btnStyle, backgroundColor: '#d9534f' }} onClick={() => handleSelectOutcome({ isOutTrigger: true, type: 'GROUND_OUT' })}>G-OUT</button>
                            </div>

                            <div style={{ height: '1px', backgroundColor: '#eee', margin: '4px 0' }} />

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                                <button style={{ ...btnStyle, backgroundColor: '#5cb85c' }} onClick={() => handleSelectOutcome({ hitType: '1B' })}>SINGLE</button>
                                <button style={{ ...btnStyle, backgroundColor: '#4cae4c' }} onClick={() => handleSelectOutcome({ hitType: '2B' })}>DOUBLE</button>
                                <button style={{ ...btnStyle, backgroundColor: '#3e8f3e' }} onClick={() => handleSelectOutcome({ hitType: '3B' })}>TRIPLE</button>
                                <button style={{ ...btnStyle, backgroundColor: '#1d4d1f' }} onClick={() => handleSelectOutcome({ hitType: 'HR' })}>HOME RUN</button>
                            </div>

                            <div style={{ height: '1px', backgroundColor: '#eee', margin: '4px 0' }} />

                            <button style={{ ...btnStyle, backgroundColor: '#f0ad4e' }} onClick={() => setIsSelectingError(true)}>REACHED ON ERROR</button>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '4px' }}>
                                <button style={{ ...btnStyle, backgroundColor: '#8a6d3b', fontSize: '0.85rem' }} onClick={() => handleSelectOutcome({ isOutTrigger: true, type: 'STRIKEOUT' })}>STRIKEOUT</button>
                                <button style={{ ...btnStyle, backgroundColor: '#31708f', fontSize: '0.85rem' }} onClick={() => handleSelectOutcome({ hitType: 'WALK' })}>WALK</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HitOutcomeModal;
