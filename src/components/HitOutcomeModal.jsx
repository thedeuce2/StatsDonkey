import React from 'react';

const HitOutcomeModal = ({ isOpen, onClose, onSelectOutcome, clickLocation }) => {
    if (!isOpen) return null;

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
                    <h3 style={{ margin: 0 }}>What happened?</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>✕</button>
                </div>

                <div style={{ padding: '1rem', backgroundColor: 'var(--sd-white)', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>

                    {/* Location Badge */}
                    {clickLocation && (
                        <div style={{ textAlign: 'center', fontSize: '0.9rem', color: 'gray', marginBottom: '0.5rem' }}>
                            Location: (x: {clickLocation.x.toFixed(1)}%, y: {clickLocation.y.toFixed(1)}%)
                        </div>
                    )}

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
                </div>
            </div>
        </div>
    );
};

export default HitOutcomeModal;
