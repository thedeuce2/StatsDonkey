import React from 'react';

const Scoreboard = ({ game, awayName, homeName }) => {
    const { score, inning, isTopInning, outs } = game;
    // Default to 0 for games that started before these properties existed
    const hits = game.hits || { away: 0, home: 0 };
    const errors = game.errors || { away: 0, home: 0 };

    return (
        <div style={{
            backgroundColor: 'var(--sd-white)', // To stand out from the dark field
            color: 'var(--sd-black)',
            display: 'flex',
            flexDirection: 'column',
            borderBottom: '2px solid var(--sd-black)',
            fontSize: '0.85rem'
        }}>
            {/* Top row: Inning, Count, Outs */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '0.2rem 0.5rem', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                <span style={{ fontSize: '1rem', marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                    <span style={{ color: isTopInning ? 'var(--sd-accent)' : '#aaa', fontSize: '0.8rem', marginRight: '2px' }}>▲</span>
                    {inning}<span style={{ fontSize: '0.7rem', alignSelf: 'flex-start', marginLeft: '1px' }}>th</span>
                    <span style={{ color: !isTopInning ? 'var(--sd-accent)' : '#aaa', fontSize: '0.8rem', marginLeft: '2px' }}>▼</span>
                </span>
                
                <span style={{ color: '#666', marginRight: '0.2rem' }}>B</span> <span style={{ marginRight: '0.8rem' }}>0</span>
                <span style={{ color: '#666', marginRight: '0.2rem' }}>S</span> <span style={{ marginRight: '0.8rem' }}>0</span>
                <span style={{ color: '#666', marginRight: '0.2rem' }}>O</span> <span>{outs}</span>
            </div>

            {/* Bottom matrix: Teams, Runs, Hits, Errors */}
            <div style={{ display: 'flex', width: '100%' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: 'left', padding: '0.3rem 0.5rem', fontWeight: 'normal', color: '#666', width: '70%' }}></th>
                            <th style={{ padding: '0.3rem 0', color: '#666', width: '10%' }}>R</th>
                            <th style={{ padding: '0.3rem 0', color: '#666', width: '10%' }}>H</th>
                            <th style={{ padding: '0.3rem 0', color: '#666', width: '10%' }}>E</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                            <td style={{ textAlign: 'left', padding: '0.3rem 0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                {awayName || 'Away'}
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{score.away}</td>
                            <td style={{ color: '#555' }}>{hits.away}</td>
                            <td style={{ color: '#555' }}>{errors.away}</td>
                        </tr>
                        <tr style={{ borderTop: '1px solid #f0f0f0' }}>
                            <td style={{ textAlign: 'left', padding: '0.3rem 0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                                {homeName || 'Home'}
                            </td>
                            <td style={{ fontWeight: 'bold' }}>{score.home}</td>
                            <td style={{ color: '#555' }}>{hits.home}</td>
                            <td style={{ color: '#555' }}>{errors.home}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    );
};

export default Scoreboard;
