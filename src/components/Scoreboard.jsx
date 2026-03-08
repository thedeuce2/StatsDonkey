import React from 'react';

const Scoreboard = ({ game, awayName, homeName }) => {
    const { score, inning, isTopInning, outs, bases } = game;

    return (
        <div className="scoreboard" style={{
            backgroundColor: 'var(--sd-dark-gray)',
            color: 'var(--sd-white)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            borderBottom: '4px solid var(--sd-accent)'
        }}>
            {/* Away Score */}
            <div style={{ textAlign: 'center', flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', color: '#ccc', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{awayName || 'Away'}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{score.away}</div>
            </div>

            {/* Inning & Outs */}
            <div style={{ textAlign: 'center', flex: 1, borderLeft: '1px solid #555', borderRight: '1px solid #555' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span style={{ color: isTopInning ? 'var(--sd-accent)' : '#555' }}>▲</span>
                    {inning}
                    <span style={{ color: !isTopInning ? 'var(--sd-accent)' : '#555' }}>▼</span>
                </div>

                {/* Outs Indicator */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: outs >= 1 ? '#ff4444' : '#555' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: outs >= 2 ? '#ff4444' : '#555' }}></div>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: outs >= 3 ? '#ff4444' : '#555' }}></div>
                </div>
                <div style={{ fontSize: '0.7rem', color: '#ccc', marginTop: '0.2rem', textTransform: 'uppercase' }}>Outs</div>
            </div>

            {/* Home Score */}
            <div style={{ textAlign: 'center', flex: 1, overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', color: '#ccc', textTransform: 'uppercase', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{homeName || 'Home'}</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{score.home}</div>
            </div>
        </div>
    );
};

export default Scoreboard;
