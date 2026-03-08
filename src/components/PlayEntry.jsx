import React, { useState, useRef } from 'react';
import HitOutcomeModal from './HitOutcomeModal';

const PlayEntry = ({ onRecordPlay, onUndo }) => {
    const svgRef = useRef(null);
    const [isOutcomeOpen, setIsOutcomeOpen] = useState(false);
    const [clickLocation, setClickLocation] = useState(null);

    // Calculate relative X, Y from 0-100 based on click inside the SVG
    const handleFieldClick = (e) => {
        if (!svgRef.current) return;

        const rect = svgRef.current.getBoundingClientRect();
        const xPixels = e.clientX - rect.left;
        const yPixels = e.clientY - rect.top;

        // Convert to percentage (0 to 100)
        const xPercent = (xPixels / rect.width) * 100;
        const yPercent = (yPixels / rect.height) * 100;

        setClickLocation({ x: xPercent, y: yPercent });
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
                    maxWidth: '400px',
                    margin: '0 auto',
                    aspectRatio: '1 / 1', // Keep it perfectly square
                    backgroundColor: '#4caf50',
                    position: 'relative',
                    cursor: 'pointer',
                    borderRadius: '8px',
                    boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                    overflow: 'hidden'
                }}
                onClick={handleFieldClick}
            >
                <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 100 100" style={{ display: 'block' }}>

                    {/* Deep Outfield Grass */}
                    <path d="M 50 90 L 95 45 A 65 65 0 0 0 5 45 Z" fill="#388E3C" />

                    {/* Shallow Outfield/Infield Grass dirt boundary */}
                    <path d="M 50 90 L 80 60 A 40 40 0 0 0 20 60 Z" fill="#4CAF50" />

                    {/* Dirt Infield Arc */}
                    <path d="M 50 90 L 75 65 A 35 35 0 0 0 25 65 Z" fill="#bcaaa4" />

                    {/* Infield Grass Square */}
                    <path d="M 50 82 L 68 64 L 50 46 L 32 64 Z" fill="#4CAF50" />

                    {/* Foul Lines */}
                    <line x1="50" y1="90" x2="5" y2="45" stroke="white" strokeWidth="0.5" />
                    <line x1="50" y1="90" x2="95" y2="45" stroke="white" strokeWidth="0.5" />

                    {/* Bases (Home, 1st, 2nd, 3rd) */}
                    <polygon points="50,90 52,88 50,86 48,88" fill="white" /> {/* Home */}
                    <rect x="73" y="63" width="3" height="3" fill="white" transform="rotate(45 74.5 64.5)" /> {/* 1st */}
                    <rect x="48.5" y="44.5" width="3" height="3" fill="white" transform="rotate(45 50 46)" /> {/* 2nd */}
                    <rect x="24" y="63" width="3" height="3" fill="white" transform="rotate(45 25.5 64.5)" /> {/* 3rd */}

                    {/* Pitcher Mound */}
                    <circle cx="50" cy="64" r="3" fill="#8d6e63" />
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
                            style={{ filter: 'drop-shadow(0px 0px 2px rgba(0,0,0,0.8))' }}
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

            {/* Undo Button - Placed neatly below the diagram */}
            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'center' }}>
                <button
                    onClick={(e) => { e.stopPropagation(); onUndo(); }}
                    style={{ backgroundColor: '#f0ad4e', border: 'none', color: 'white', padding: '0.75rem 2rem', borderRadius: '25px', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.2)' }}
                >
                    UNDO LAST PLAY
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
