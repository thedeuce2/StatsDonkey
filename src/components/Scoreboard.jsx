import React from 'react';

const Scoreboard = ({ game, awayName, homeName }) => {
    const { score, inning, isTopInning, outs } = game;
    // Default to 0 for games that started before these properties existed
    const hits = game.hits || { away: 0, home: 0 };
    const errors = game.errors || { away: 0, home: 0 };

    return (
        <div className="scoreboard" style={{
            backgroundColor: 'var(--sd-dark-gray)',
            color: 'var(--sd-white)',
            display: 'flex',
            alignItems: 'stretch',
            borderBottom: '4px solid var(--sd-accent)'
        }}>

            {/* Main Score Area */}
            <div style={{ display: 'flex', flex: 1, padding: '1rem', alignItems: 'center', justifyContent: 'space-around' }}>
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

            {/* R-H-E Section */}
            <div style={{ width: '80px', borderLeft: '1px solid #555', backgroundColor: '#222', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <table style={{ width: '100%', textAlign: 'center', fontSize: '0.85rem', borderCollapse: 'collapse', color: '#ccc' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid #444' }}>
                            <th style={{ padding: '0.2rem 0', fontWeight: 'normal' }}>R</th>
                            <th style={{ padding: '0.2rem 0', fontWeight: 'normal' }}>H</th>
                            <th style={{ padding: '0.2rem 0', fontWeight: 'normal' }}>E</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style={{ padding: '0.2rem 0', fontWeight: 'bold', color: 'white' }}>{score.away}</td>
                            <td style={{ padding: '0.2rem 0', fontWeight: 'bold', color: 'white' }}>{hits.away}</td>
                            <td style={{ padding: '0.2rem 0', fontWeight: 'bold', color: 'red' }}>{errors.away}</td>
                        </tr>
                        <tr>
                            <td style={{ padding: '0.2rem 0', fontWeight: 'bold', color: 'white' }}>{score.home}</td>
                            <td style={{ padding: '0.2rem 0', fontWeight: 'bold', color: 'white' }}>{hits.home}</td>
                            <td style={{ padding: '0.2rem 0', fontWeight: 'bold', color: 'red' }}>{errors.home}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Scoreboard;
