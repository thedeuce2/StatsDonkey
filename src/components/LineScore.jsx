import React from 'react';

const LineScore = ({ lineScore, awayName, homeName }) => {
    // Determine the number of columns to show. Minimum 7 innings, but expand if game goes longer.
    const maxInnings = Math.max(7, lineScore.away.length, lineScore.home.length);
    const columns = Array.from({ length: maxInnings }, (_, i) => i + 1);

    const calcTotal = (line) => line.reduce((sum, runs) => sum + (runs || 0), 0);

    return (
        <div style={{ padding: '1rem', overflowX: 'auto', backgroundColor: 'var(--sd-white)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--sd-black)', color: '#666' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Team</th>
                        {columns.map(col => (
                            <th key={col} style={{ width: '30px', padding: '0.5rem' }}>{col}</th>
                        ))}
                        <th style={{ padding: '0.5rem', fontWeight: 'bold', borderLeft: '2px solid #ddd' }}>R</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{awayName || 'Away'}</td>
                        {columns.map((col, idx) => (
                            <td key={col} style={{ padding: '0.5rem' }}>
                                {lineScore.away[idx] !== undefined ? lineScore.away[idx] : '-'}
                            </td>
                        ))}
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', borderLeft: '2px solid #ddd' }}>
                            {calcTotal(lineScore.away)}
                        </td>
                    </tr>
                    <tr>
                        <td style={{ textAlign: 'left', padding: '0.5rem', fontWeight: 'bold', whiteSpace: 'nowrap', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{homeName || 'Home'}</td>
                        {columns.map((col, idx) => (
                            <td key={col} style={{ padding: '0.5rem' }}>
                                {lineScore.home[idx] !== undefined ? lineScore.home[idx] : '-'}
                            </td>
                        ))}
                        <td style={{ padding: '0.5rem', fontWeight: 'bold', borderLeft: '2px solid #ddd' }}>
                            {calcTotal(lineScore.home)}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default LineScore;
