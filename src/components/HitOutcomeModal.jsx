import React, { useState } from 'react';

const POSITIONS = ['P', 'C', '1B', '2B', '3B', 'SS', 'LF', 'LC', 'RC', 'RF', 'EH'];

const HitOutcomeModal = ({ isOpen, onClose, onSelectOutcome, clickLocation }) => {
    const [isSelectingError, setIsSelectingError] = useState(false);
    const [errorFielder, setErrorFielder] = useState('SS');
    const [errorType, setErrorType] = useState('Fielding');

    if (!isOpen) return null;

    const handleClose = () => {
        setIsSelectingError(false);
        onClose();
    };

    const submitError = () => {
        onSelectOutcome({ hitType: 'ROE', errorDetail: { fielder: errorFielder, type: errorType } });
        setIsSelectingError(false);
    };

    const btnStyle = {
        padding: '1rem',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        color: 'white',
        width: '100%'
    };

    return (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1100, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ backgroundColor: 'var(--sd-beige)', width: '90%', maxWidth: '350px', borderRadius: '12px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-dark-gray)', color: 'var(--sd-white)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ margin: 0 }}>{isSelectingError ? 'Error Details' : 'What happened?'}</h3>
                    <button onClick={handleClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-white)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                    {/* Location Badge */}
                    {!isSelectingError && clickLocation && (
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'gray', marginBottom: '0.5rem' }}>
                            Location: (x: {clickLocation.x.toFixed(1)}%, y: {clickLocation.y.toFixed(1)}%)
                        </div>
                    )}

                    {isSelectingError ? (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Who made the error?</label>
                                <select
                                    value={errorFielder}
                                    onChange={(e) => setErrorFielder(e.target.value)}
                                    style={{ padding: '0.75rem', fontSize: '1.1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                                <label style={{ fontWeight: 'bold' }}>Error Type?</label>
                                <select
                                    value={errorType}
                                    onChange={(e) => setErrorType(e.target.value)}
                                    style={{ padding: '0.75rem', fontSize: '1.1rem', borderRadius: '4px', border: '1px solid #ccc' }}
                                >
                                    <option value="Fielding">Fielding Error</option>
                                    <option value="Throwing">Throwing Error</option>
                                    <option value="Dropped Catch">Dropped Catch</option>
                                </select>
                            </div>

                            <button
                                style={{ ...btnStyle, backgroundColor: 'var(--sd-accent)', marginTop: '2rem' }}
                                onClick={submitError}
                            >
                                CONFIRM ROE
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#ccc', color: '#333' }}
                                onClick={() => setIsSelectingError(false)}
                            >
                                BACK
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#d9534f' }}
                                onClick={() => onSelectOutcome({ isOutTrigger: true, type: 'OUT' })}
                            >
                                BALL CAUGHT (OUT)
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#d9534f' }}
                                onClick={() => onSelectOutcome({ isOutTrigger: true, type: 'GROUND_OUT' })}
                            >
                                GROUND OUT
                            </button>

                            <hr style={{ width: '100%', borderColor: '#eee', margin: '0.5rem 0' }} />

                            <button
                                style={{ ...btnStyle, backgroundColor: '#5cb85c' }}
                                onClick={() => onSelectOutcome({ hitType: '1B' })}
                            >
                                SINGLE
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#4cae4c' }}
                                onClick={() => onSelectOutcome({ hitType: '2B' })}
                            >
                                DOUBLE
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#3e8f3e' }}
                                onClick={() => onSelectOutcome({ hitType: '3B' })}
                            >
                                TRIPLE
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#2b542c' }}
                                onClick={() => onSelectOutcome({ hitType: 'HR' })}
                            >
                                HOME RUN
                            </button>

                            <hr style={{ width: '100%', borderColor: '#eee', margin: '0.5rem 0' }} />

                            <button
                                style={{ ...btnStyle, backgroundColor: '#f0ad4e' }}
                                onClick={() => setIsSelectingError(true)}
                            >
                                REACHED ON ERROR
                            </button>

                            <hr style={{ width: '100%', borderColor: '#eee', margin: '0.5rem 0' }} />

                            <button
                                style={{ ...btnStyle, backgroundColor: '#8a6d3b', color: 'white' }}
                                onClick={() => onSelectOutcome({ isOutTrigger: true, type: 'STRIKEOUT' })}
                            >
                                STRIKEOUT
                            </button>
                            <button
                                style={{ ...btnStyle, backgroundColor: '#31708f', color: 'white' }}
                                onClick={() => onSelectOutcome({ hitType: 'WALK' })}
                            >
                                WALK
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default HitOutcomeModal;
