import React, { useState, useRef } from 'react';
import HitOutcomeModal from './HitOutcomeModal';

const PlayEntry = ({ onRecordPlay, onUndo, bases = {}, events = [] }) => {
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
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}>
                {/* Field Container - Optimized for Dashboard View */}
                <div 
                    style={{ 
                        width: '100%',
                        maxWidth: '1000px', 
                        minHeight: '550px',
                        aspectRatio: '1.2 / 1', 
                        backgroundColor: '#1E3522',
                        borderRadius: '20px',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.7), inset 0 0 100px rgba(0,0,0,0.5)',
                        border: '2px solid #2d452d',
                        position: 'relative',
                        cursor: 'crosshair',
                        display: 'flex',
                        flexDirection: 'column',
                        flexShrink: 0,
                        marginBottom: '40px'
                    }}
                    onClick={handleFieldClick}
                >
                    <svg 
                        ref={svgRef} 
                        viewBox="-25 0 150 120" 
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

                        {/* 1. Aerial Field Background Image */}
                        <image 
                            href="/field.jpg" 
                            x="-25" y="0" 
                            width="150" height="120" 
                            preserveAspectRatio="xMidYMid slice"
                        />
                        
                        {/* 2. DYNAMIC BASES (Only show when occupied) */}
                        {/* Home Plate */}
                        <polygon points="50,98.25 53,95.25 50,92.25 47,95.25" fill="none" stroke="none" />
                        
                        {/* 1st Base */}
                        {bases.first && (
                            <rect 
                                x="72.2" y="77.0" width="3.5" height="3.5" 
                                fill="#ffc107" 
                                stroke="#b48600" 
                                strokeWidth="0.2" 
                                transform="rotate(38 73.95 78.75)"
                                style={{ filter: 'url(#baseGlow)' }}
                            />
                        )}
                        
                        {/* 2nd Base */}
                        {bases.second && (
                            <rect 
                                x="48.25" y="59.5" width="3.5" height="3.5" 
                                fill="#ffc107" 
                                stroke="#b48600" 
                                strokeWidth="0.2" 
                                transform="rotate(45 50 61.25)"
                                style={{ filter: 'url(#baseGlow)' }}
                            />
                        )}
                        
                        {/* 3rd Base */}
                        {bases.third && (
                            <rect 
                                x="24.3" y="77.0" width="3.5" height="3.5" 
                                fill="#ffc107" 
                                stroke="#b48600" 
                                strokeWidth="0.2" 
                                transform="rotate(-38 26.05 78.75)"
                                style={{ filter: 'url(#baseGlow)' }}
                            />
                        )}
                        
                        {/* Note: Home plate doesn't need a highlight as the runner "scores" and leaves */}

                        {/* 8. HISTORICAL PLAY MARKERS */}
                        {events.filter(ev => !ev.playInfo.isSub && ev.playInfo.location).map((ev, idx) => {
                            const { location, hitType, isOutTrigger } = ev.playInfo;
                            const isHit = ['1B','2B','3B','HR'].includes(hitType);
                            const markerColor = isHit ? '#2ecc71' : (isOutTrigger ? '#e74c3c' : '#bdc3c7');
                            return (
                                <g key={idx} opacity="0.75">
                                    <circle cx={location.x} cy={location.y} r="1.8" fill={markerColor} stroke="white" strokeWidth="0.3" />
                                </g>
                            );
                        })}

                        {/* 9. CURRENT CLICK MARKER (Active/Tapped) */}
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
