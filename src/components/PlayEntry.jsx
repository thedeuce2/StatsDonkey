import React, { useState, useRef } from 'react';
import HitOutcomeModal from './HitOutcomeModal';

const PlayEntry = ({ onRecordPlay, onUndo }) => {
    const svgRef = useRef(null);
    const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
    const [clickLocation, setClickLocation] = useState(null);

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
                    flexGrow: 1, // Let it take up remaining vertical space
                    backgroundColor: '#1E3522', /* Darker richer grass base */
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                onClick={handleFieldClick}
            >
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 20 100 75" preserveAspectRatio="xMidYMid meet" style={{ display: 'block' }}>

                    {/* Deep Outfield Grass */}
                    <path d="M 50 90 L 95 45 A 65 65 0 0 0 5 45 Z" fill="#2E5C31" />

                    {/* Shallow Outfield/Infield Grass dirt boundary */}
                    <path d="M 50 90 L 80 60 A 40 40 0 0 0 20 60 Z" fill="#3D7A40" />

                    {/* Dirt Infield Arc */}
                    <path d="M 50 90 L 75 65 A 35 35 0 0 0 25 65 Z" fill="#8C6B52" />

                    {/* Infield Grass Square */}
                    <path d="M 50 82 L 68 64 L 50 46 L 32 64 Z" fill="#3D7A40" />

                    {/* Foul Lines */}
                    <line x1="50" y1="90" x2="5" y2="45" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />
                    <line x1="50" y1="90" x2="95" y2="45" stroke="rgba(255,255,255,0.6)" strokeWidth="0.5" />

                    {/* Bases (Home, 1st, 2nd, 3rd) */}
                    <polygon points="50,90 52,88 50,86 48,88" fill="rgba(255,255,255,0.9)" /> {/* Home */}
                    <rect x="73" y="63" width="3" height="3" fill="rgba(255,255,255,0.9)" transform="rotate(45 74.5 64.5)" /> {/* 1st */}
                    <rect x="48.5" y="44.5" width="3" height="3" fill="rgba(255,255,255,0.9)" transform="rotate(45 50 46)" /> {/* 2nd */}
                    <rect x="24" y="63" width="3" height="3" fill="rgba(255,255,255,0.9)" transform="rotate(45 25.5 64.5)" /> {/* 3rd */}

                    {/* Pitcher Mound */}
                    <circle cx="50" cy="64" r="3" fill="#6A4D3B" />
                    <rect x="49" y="63.5" width="2" height="1" fill="white" />

                    {/* Visual Indicator of click */}
                    {clickLocation && (
                        <circle
                            cx={clickLocation.x}
                            cy={clickLocation.y}
                            r="2.5"
                            fill="red"
                            stroke="white"
                            strokeWidth="1"
                            style={{ filter: 'drop-shadow(0px 0px 4px rgba(0,0,0,0.8))' }}
                        />
                    )}
                </svg>

                {/* Overlay Instructions */}
                <div style={{ position: 'absolute', top: '10px', left: '0', width: '100%', textAlign: 'center', pointerEvents: 'none' }}>
                    <span style={{ backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 16px', borderRadius: '16px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Tap field to log hit
                    </span>
                </div>
            </div>

            {/* Bottom Floating Action Buttons */}
            <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', right: '1rem', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
                {/* Save & Exit Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        // Assuming navigate is passed down or we can just window.location
                        window.location.href = '/';
                    }}
                    style={{ backgroundColor: 'rgba(50,50,50,0.8)', border: '1px solid #777', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                >
                    Quit
                </button>

                {/* Undo Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onUndo(); }}
                    style={{ backgroundColor: 'rgba(50,50,50,0.8)', border: '1px solid #777', color: 'white', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer', backdropFilter: 'blur(4px)' }}
                >
                    Undo
                </button>
            </div>

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
