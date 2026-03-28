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
            display: 'flex', 
            flexDirection: 'column', 
            height: '100%', 
            position: 'relative',
            overflow: 'hidden' 
        }}>

            {/* Scrollable Container for the Field */}
            <div
                style={{
                    width: '100%',
                    flexGrow: 1,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    backgroundColor: '#111',
                    padding: '10px',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* The Field Diagram - Scaled for visibility */}
                <div
                    style={{
                        width: '100%',
                        minHeight: '600px', /* Ensure it has enough height to be useful and scrollable */
                        backgroundColor: '#162b19',
                        position: 'relative',
                        cursor: 'crosshair',
                        borderRadius: '12px',
                        boxShadow: 'inset 0 0 50px rgba(0,0,0,0.8)',
                        border: '1px solid #2d452d',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                    }}
                    onClick={handleFieldClick}
                >
                    <svg 
                        ref={svgRef} 
                        viewBox="0 0 100 100" 
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
                            <radialGradient id="grassGrad" cx="50%" cy="85%" r="85%">
                                <stop offset="0%" style={{ stopColor: '#3d7a40', stopOpacity: 1 }} />
                                <stop offset="60%" style={{ stopColor: '#2e5c31', stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: '#162b19', stopOpacity: 1 }} />
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
                        <path d="M 50 95 L 98 55 A 60 60 0 0 0 2 55 Z" fill="url(#grassGrad)" stroke="#2d452d" strokeWidth="0.5" />
                        
                        {/* Foul Pole lines extensions */}
                        <line x1="2" y1="55" x2="2" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="1,1" />
                        <line x1="98" y1="55" x2="98" y2="5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" strokeDasharray="1,1" />

                        {/* Dirt Warning Track Area / Outer Infield */}
                        <path d="M 50 95 L 82 63 A 42 42 0 0 0 18 63 Z" fill="url(#dirtGrad)" />

                        {/* Infield Grass Square (Rotated Diamond) */}
                        <path d="M 50 86 L 70 66 L 50 46 L 30 66 Z" fill="#4a8f4d" stroke="#3d7a40" strokeWidth="0.5" />
                        
                        {/* Baselines (Chalk) */}
                        <line x1="50" y1="95" x2="2" y2="55" stroke="white" strokeWidth="0.5" opacity="0.8" />
                        <line x1="50" y1="95" x2="98" y2="55" stroke="white" strokeWidth="0.5" opacity="0.8" />

                        {/* Pitcher's Mound */}
                        <circle cx="50" cy="65" r="3" fill="#8c6b52" stroke="#755a45" strokeWidth="0.5" />
                        <rect x="48.5" y="64.5" width="3" height="0.8" fill="white" />

                        {/* Bases */}
                        {/* Home Plate */}
                        <polygon points="50,95 53,92 50,89 47,92" fill="white" stroke="#ccc" strokeWidth="0.2" />
                        
                        {/* 1st Base */}
                        <rect 
                            x="68.5" y="64.5" width="3.5" height="3.5" 
                            fill={getBaseColor('first')} 
                            stroke={bases.first ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 70.25 66.25)"
                            style={bases.first ? { filter: 'url(#baseGlow)' } : {}}
                        />
                        
                        {/* 2nd Base */}
                        <rect 
                            x="48.25" y="44.25" width="3.5" height="3.5" 
                            fill={getBaseColor('second')} 
                            stroke={bases.second ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 50 46)"
                            style={bases.second ? { filter: 'url(#baseGlow)' } : {}}
                        />
                        
                        {/* 3rd Base */}
                        <rect 
                            x="28.25" y="64.5" width="3.5" height="3.5" 
                            fill={getBaseColor('third')} 
                            stroke={bases.third ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 30 66.25)"
                            style={bases.third ? { filter: 'url(#baseGlow)' } : {}}
                        />

                        {/* Visual Indicator of click */}
                        {clickLocation && (
                            <g>
                                <circle cx={clickLocation.x} cy={clickLocation.y} r="3" fill="rgba(255, 0, 0, 0.4)" />
                                <circle cx={clickLocation.x} cy={clickLocation.y} r="1.5" fill="red" stroke="white" strokeWidth="0.5" />
                            </g>
                        )}
                    </svg>

                    {/* Overlay Instructions */}
                    <div style={{ position: 'absolute', top: '15px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                        <span style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '8px 24px', borderRadius: '30px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', boxShadow: '0 4px 15px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Tap Field to Log Play
                        </span>
                    </div>
                </div>

                {/* Bottom Spacer to ensure home plate isn't at the absolute edge of scrolling */}
                <div style={{ height: '50px', flexShrink: 0 }} />
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
