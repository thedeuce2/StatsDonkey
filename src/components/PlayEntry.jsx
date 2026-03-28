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
        <div style={{ 
            flexGrow: 1, 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'hidden',
            backgroundColor: '#050a06',
            position: 'relative'
        }}>
            {/* Scrollable Viewport */}
            <div style={{ 
                flexGrow: 1, 
                overflowY: 'auto', 
                overflowX: 'hidden', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Field Container - Stable size */}
                <div 
                    style={{ 
                        width: '100%',
                        maxWidth: '1000px', 
                        minHeight: '800px',
                        aspectRatio: '1 / 1.2',
                        backgroundColor: '#1E3522',
                        borderRadius: '24px',
                        boxShadow: '0 25px 60px rgba(0,0,0,0.7), inset 0 0 120px rgba(0,0,0,0.5)',
                        border: '3px solid #2d452d',
                        position: 'relative',
                        cursor: 'crosshair',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        marginBottom: '60px'
                    }}
                    onClick={handleFieldClick}
                >
                    <svg 
                        ref={svgRef} 
                        viewBox="0 0 100 115" 
                        preserveAspectRatio="xMidYMid meet" 
                        style={{ 
                            width: '100%',
                            height: '100%',
                            display: 'block',
                            touchAction: 'none'
                        }}
                    >
                        {/* Definitions for gradients and effects */}
                        <defs>
                            <radialGradient id="grassGrad" cx="50%" cy="100%" r="120%">
                                <stop offset="0%" style={{ stopColor: '#3d7a40', stopOpacity: 1 }} />
                                <stop offset="50%" style={{ stopColor: '#2e5c31', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#162b19', stopOpacity: 1 }} />
                            </radialGradient>
                            <linearGradient id="dirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" style={{ stopColor: '#c29b7a', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#8c6b52', stopOpacity: 1 }} />
                            </linearGradient>
                            <filter id="baseGlow" x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="1.5" result="blur" />
                                <feFlood floodColor="#ffc107" floodOpacity="1" result="color" />
                                <feComposite in="color" in2="blur" operator="in" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* 1. FOUL TERRITORY (Large background grass) */}
                        <rect x="0" y="0" width="100" height="115" fill="#122415" rx="12" />
                        
                        {/* 2. FAIR TERRITORY (Outfield Arc - MAX DEPTH) */}
                        <path 
                            d="M 50 110 L 98 10 A 95 95 0 0 0 2 10 Z" 
                            fill="url(#grassGrad)" 
                            stroke="#2d452d" 
                            strokeWidth="0.5" 
                        />
                        
                        {/* 3. FOUL LINES */}
                        <line x1="50" y1="110" x2="-20" y2="5" stroke="white" strokeWidth="0.7" opacity="0.8" />
                        <line x1="50" y1="110" x2="120" y2="5" stroke="white" strokeWidth="0.7" opacity="0.8" />

                        {/* 4. DIRT INFIELD AREA */}
                        <path d="M 50 110 L 85 75 A 50 50 0 0 0 15 75 Z" fill="url(#dirtGrad)" />

                        {/* 5. INFIELD GRASS DIAMOND */}
                        <path d="M 50 100 L 70 80 L 50 60 L 30 80 Z" fill="#4a8f4d" stroke="#3d7a40" strokeWidth="0.5" />

                        {/* 6. PITCHER'S MOUND */}
                        <circle cx="50" cy="80" r="3.2" fill="#8c6b52" stroke="#755a45" strokeWidth="0.5" />
                        <rect x="48.5" y="79.5" width="3" height="0.8" fill="white" />

                        {/* 7. BASES */}
                        {/* Home Plate */}
                        <polygon points="50,110 54,106 50,102 46,106" fill="white" stroke="#ccc" strokeWidth="0.2" />
                        
                        {/* 1st Base */}
                        <rect 
                            x="68.25" y="78.25" width="3.5" height="3.5" 
                            fill={getBaseColor('first')} 
                            stroke={bases.first ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 70 80)"
                            style={bases.first ? { filter: 'url(#baseGlow)' } : {}}
                        />
                        
                        {/* 2nd Base */}
                        <rect 
                            x="48.25" y="58.25" width="3.5" height="3.5" 
                            fill={getBaseColor('second')} 
                            stroke={bases.second ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 50 60)"
                            style={bases.second ? { filter: 'url(#baseGlow)' } : {}}
                        />
                        
                        {/* 3rd Base */}
                        <rect 
                            x="28.25" y="78.25" width="3.5" height="3.5" 
                            fill={getBaseColor('third')} 
                            stroke={bases.third ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 30 80)"
                            style={bases.third ? { filter: 'url(#baseGlow)' } : {}}
                        />

                        {/* 8. LAST PLAY MARKER */}
                        {clickLocation && (
                            <g>
                                <circle cx={clickLocation.x} cy={clickLocation.y} r="3" fill="rgba(255, 0, 0, 0.4)" />
                                <circle cx={clickLocation.x} cy={clickLocation.y} r="1.5" fill="red" stroke="white" strokeWidth="0.5" />
                            </g>
                        )}
                    </svg>

                    {/* Instruction Tag */}
                    <div style={{ position: 'absolute', top: '25px', left: '0', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.85)', color: 'white', padding: '12px 28px', borderRadius: '40px', fontSize: '0.85rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: '0 8px 30px rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Tap Field Area to Log Play
                        </div>
                    </div>
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
