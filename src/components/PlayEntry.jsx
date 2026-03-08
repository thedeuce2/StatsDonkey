import React from 'react';

const PlayEntry = ({ onRecordPlay, onUndo }) => {

    // Helper to structure the play payload
    const record = (type, isOut, bases = 0) => {
        onRecordPlay({ type, isOut, bases });
    };

    const btnStyle = {
        padding: '1.5rem 0',
        fontSize: '1.2rem',
        fontWeight: 'bold',
        borderRadius: '8px',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
        color: 'white'
    };

    return (
        <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--sd-dark-gray)' }}>Quick Entry</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flexGrow: 1 }}>

                {/* Outs Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        style={{ ...btnStyle, backgroundColor: '#d9534f' }}
                        onClick={() => record('OUT', true)}
                    >
                        OUT
                    </button>
                    <button
                        style={{ ...btnStyle, backgroundColor: '#f0ad4e', padding: '1rem 0', fontSize: '1rem' }}
                        onClick={() => onUndo()}
                    >
                        UNDO LAST
                    </button>
                </div>

                {/* Hits Column */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <button
                        style={{ ...btnStyle, backgroundColor: '#5cb85c', padding: '1rem 0' }}
                        onClick={() => record('1B', false, 1)}
                    >
                        SINGLE
                    </button>
                    <button
                        style={{ ...btnStyle, backgroundColor: '#4cae4c', padding: '1rem 0' }}
                        onClick={() => record('2B', false, 2)}
                    >
                        DOUBLE
                    </button>
                    <button
                        style={{ ...btnStyle, backgroundColor: '#3e8f3e', padding: '1rem 0' }}
                        onClick={() => record('3B', false, 3)}
                    >
                        TRIPLE
                    </button>
                    <button
                        style={{ ...btnStyle, backgroundColor: '#2b542c', padding: '1rem 0' }}
                        onClick={() => record('HR', false, 4)}
                    >
                        HOME RUN
                    </button>
                </div>

            </div>
        </div>
    );
};

export default PlayEntry;
