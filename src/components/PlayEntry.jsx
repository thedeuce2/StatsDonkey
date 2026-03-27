import React, { useState, useRef } from 'react';
import HitOutcomeModal from './HitOutcomeModal';

const PlayEntry = ({ onRecordPlay, onUndo, bases = {} }) => {
    const svgRef = useRef(null);
    const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
    const [clickLocation, setClickLocation] = useState(null);

    // Helper to determine base color based on runner presence
    const getBaseColor = (baseKey) => {
        return bases[baseKey] ? '#ffc107' : 'white'; // Amber/Yellow if occupied
    };

    // Calculate exact SVG coordinates based on viewport scaling
    const handleFieldClick = (e) => {
        if (!svgRef.current) return;
        const svg = svgRef.current;

        // Native SVG Coordinate Transformation
        const pt = svg.createSVGPoint();
        pt.x = e.clientX;
        pt.y = e.clientY;

        // Transform screen pixels to exact SVG viewBox coordinates, resolving responsive stretching
        const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());

        setClickLocation({ x: svgP.x, y: svgP.y });
        setIsOutcomeOpen(true);
    };

    const handleOutcomeSelect = (outcomePayload) => {
        const finalPayload = {
            ...outcomePayload,
            location: clickLocation
        };

        onRecordPlay(finalPayload);
        setIsOutcomeOpen(false);
        setClickLocation(null);
    };

    return (
        <div style={{ padding: '1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>

            {/* The Field Diagram - Constrained for mobile/desktop UI */}
            <div
                style={{
                    width: '100%',
                    flexGrow: 1,
                    backgroundColor: '#1E3522', 
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    boxShadow: 'inset 0 0 40px rgba(0,0,0,0.6)',
                    overflow: 'hidden',
                    border: '2px solid #2d452d'
                }}
                onClick={handleFieldClick}
            >
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 10 100 85" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0, display: 'block' }}>
                    {/* Definitions for gradients and effects */}
                    <defs>
                        <radialGradient id="grassGrad" cx="50%" cy="80%" r="80%">
                            <stop offset="0%" style={{ stopColor: '#3d7a40', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#1e3522', stopOpacity: 1 }} />
                        </radialGradient>
                        <linearGradient id="dirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style={{ stopColor: '#c29b7a', stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: '#8c6b52', stopOpacity: 1 }} />
                        </linearGradient>
                        <filter id="baseGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceAlpha" stdDeviation="1" result="blur" />
                            <feFlood floodColor="#ffc107" floodOpacity="0.8" result="color" />
                            <feComposite in="color" in2="blur" operator="in" result="glow" />
                            <feMerge>
                                <feMergeNode in="glow" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Main Outfield Arc */}
                    <path d="M 50 90 L 98 42 A 68 68 0 0 0 2 42 Z" fill="url(#grassGrad)" stroke="#2d452d" strokeWidth="0.5" />

                    {/* Dirt Warning Track Area / Outer Infield */}
                    <path d="M 50 91 L 82 59 A 45 45 0 0 0 18 59 Z" fill="url(#dirtGrad)" />

                    {/* Infield Grass Square (Rotated Diamond) */}
                    <path d="M 50 82 L 70 62 L 50 42 L 30 62 Z" fill="#4a8f4d" stroke="#3d7a40" strokeWidth="0.5" />
                    
                    {/* Baselines (Chalk) */}
                    <line x1="50" y1="90" x2="5" y2="45" stroke="white" strokeWidth="0.4" opacity="0.6" />
                    <line x1="50" y1="90" x2="95" y2="45" stroke="white" strokeWidth="0.4" opacity="0.6" />

                    {/* Pitcher's Mound */}
                    <circle cx="50" cy="62" r="3.5" fill="#8c6b52" stroke="#755a45" strokeWidth="0.5" />
                    <rect x="48.5" y="61.5" width="3" height="0.8" fill="white" />

                    {/* Bases */}
                    {/* Home Plate */}
                    <polygon points="50,90 52.5,87.5 50,85 47.5,87.5" fill="white" stroke="#ccc" strokeWidth="0.2" />
                    
                    {/* 1st Base */}
                    <rect 
                        x="68.5" y="60.5" width="3.5" height="3.5" 
                        fill={getBaseColor('first')} 
                        stroke={bases.first ? '#b48600' : '#ccc'} 
                        strokeWidth="0.2" 
                        transform="rotate(45 70.25 62.25)"
                        style={bases.first ? { filter: 'url(#baseGlow)' } : {}}
                    />
                    
                    {/* 2nd Base */}
                    <rect 
                        x="48.25" y="40.25" width="3.5" height="3.5" 
                        fill={getBaseColor('second')} 
                        stroke={bases.second ? '#b48600' : '#ccc'} 
                        strokeWidth="0.2" 
                        transform="rotate(45 50 42)"
                        style={bases.second ? { filter: 'url(#baseGlow)' } : {}}
                    />
                    
                    {/* 3rd Base */}
                    <rect 
                        x="28.25" y="60.5" width="3.5" height="3.5" 
                        fill={getBaseColor('third')} 
                        stroke={bases.third ? '#b48600' : '#ccc'} 
                        strokeWidth="0.2" 
                        transform="rotate(45 30 62.25)"
                        style={bases.third ? { filter: 'url(#baseGlow)' } : {}}
                    />

                    {/* Visual Indicator of click */}
                    {clickLocation && (
                        <g>
                            <circle cx={clickLocation.x} cy={clickLocation.y} r="2.8" fill="rgba(255, 0, 0, 0.4)" />
                            <circle cx={clickLocation.x} cy={clickLocation.y} r="1.2" fill="red" stroke="white" strokeWidth="0.5" />
                        </g>
                    )}
                </svg>

                {/* Overlay Instructions */}
                <div style={{ position: 'absolute', top: '15px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
                        Tap Field to Record Hit
                    </span>
                </div>
            </div>

            {/* Hit Outcome Modal */}
            <HitOutcomeModal
                isOpen={isOutcomeOpen}
                onClose={() => { setIsOutcomeOpen(false); setClickLocation(null); }}
                onSelectOutcome={handleOutcomeSelect}
                clickLocation={clickLocation}
            />
        </div>
    );
};


export default PlayEntry;
