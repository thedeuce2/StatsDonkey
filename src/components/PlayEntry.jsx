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
            backgroundColor: '#0a140b',
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
                        maxWidth: '900px', /* Don't let it get absurdly wide on big desktops */
                        minHeight: '700px',
                        aspectRatio: '1 / 1.1', /* Slightly taller than wide to focus on the diamond */
                        backgroundColor: '#162b19',
                        borderRadius: '16px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6), inset 0 0 100px rgba(0,0,0,0.4)',
                        border: '2px solid #2d452d',
                        position: 'relative',
                        cursor: 'crosshair',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        marginBottom: '40px' /* Room for home plate at bottom */
                    }}
                    onClick={handleFieldClick}
                >
                    <svg 
                        ref={svgRef} 
                        viewBox="0 0 100 110" 
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
                                <feGaussianBlur in="SourceAlpha" stdDeviation="1.2" result="blur" />
                                <feFlood floodColor="#ffc107" floodOpacity="1" result="color" />
                                <feComposite in="color" in2="blur" operator="in" result="glow" />
                                <feMerge>
                                    <feMergeNode in="glow" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {/* Outer Turf Background */}
                        <rect x="0" y="0" width="100" height="110" fill="#162b19" rx="8" />

                        {/* Main Outfield Arc */}
                        <path d="M 50 100 L 98 60 A 62 62 0 0 0 2 60 Z" fill="url(#grassGrad)" stroke="#2d452d" strokeWidth="0.5" />
                        
                        {/* Foul Lines / Poles */}
                        <line x1="50" y1="100" x2="2" y2="60" stroke="white" strokeWidth="0.6" opacity="0.9" />
                        <line x1="50" y1="100" x2="98" y2="60" stroke="white" strokeWidth="0.6" opacity="0.9" />
                        
                        {/* Dirt Infield Area */}
                        <path d="M 50 100 L 84 66 A 45 45 0 0 0 16 66 Z" fill="url(#dirtGrad)" />

                        {/* Infield Grass Diamond */}
                        <path d="M 50 90 L 71 69 L 50 48 L 29 69 Z" fill="#4a8f4d" stroke="#3d7a40" strokeWidth="0.5" />

                        {/* Pitcher's Mound */}
                        <circle cx="50" cy="69" r="3.2" fill="#8c6b52" stroke="#755a45" strokeWidth="0.5" />
                        <rect x="48.5" y="68.5" width="3" height="0.8" fill="white" />

                        {/* Bases */}
                        {/* Home Plate */}
                        <polygon points="50,100 53.5,96.5 50,93 46.5,96.5" fill="white" stroke="#ccc" strokeWidth="0.2" />
                        
                        {/* 1st Base */}
                        <rect 
                            x="69.25" y="67.25" width="3.5" height="3.5" 
                            fill={getBaseColor('first')} 
                            stroke={bases.first ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 71 69)"
                            style={bases.first ? { filter: 'url(#baseGlow)' } : {}}
                        />
                        
                        {/* 2nd Base */}
                        <rect 
                            x="48.25" y="46.25" width="3.5" height="3.5" 
                            fill={getBaseColor('second')} 
                            stroke={bases.second ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 50 48)"
                            style={bases.second ? { filter: 'url(#baseGlow)' } : {}}
                        />
                        
                        {/* 3rd Base */}
                        <rect 
                            x="27.25" y="67.25" width="3.5" height="3.5" 
                            fill={getBaseColor('third')} 
                            stroke={bases.third ? '#b48600' : '#ccc'} 
                            strokeWidth="0.2" 
                            transform="rotate(45 29 69)"
                            style={bases.third ? { filter: 'url(#baseGlow)' } : {}}
                        />

                        {/* Last Play Marker */}
                        {clickLocation && (
                            <g>
                                <circle cx={clickLocation.x} cy={clickLocation.y} r="3" fill="rgba(255, 0, 0, 0.4)" />
                                <circle cx={clickLocation.x} cy={clickLocation.y} r="1.5" fill="red" stroke="white" strokeWidth="0.5" />
                            </g>
                        )}
                    </svg>

                    {/* Instruction Tag */}
                    <div style={{ position: 'absolute', top: '20px', left: '0', width: '100%', display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                        <div style={{ backgroundColor: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 24px', borderRadius: '40px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1.5px', boxShadow: '0 8px 20px rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            Tap Diagram to Record Out / Hit
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
