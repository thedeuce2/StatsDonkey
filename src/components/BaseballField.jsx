import React, { useRef, useState } from 'react';

const BaseballField = ({ onLocationSelected }) => {
    const svgRef = useRef(null);
    const [marker, setMarker] = useState(null);

    const handleFieldClick = (e) => {
        if (!svgRef.current) return;

        // Get the bounding rectangle of the SVG to calculate relative percentages
        const rect = svgRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate as a percentage (0-100) from top-left for responsiveness
        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;

        setMarker({ x: percentX, y: percentY });

        // Pass the coordinates up to the parent component
        if (onLocationSelected) {
            onLocationSelected({ x: percentX, y: percentY });
        }
    };

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', backgroundColor: '#e2f0d9' }}>
            {/* Simplified SVG representation of a Baseball Field */}
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
                onClick={handleFieldClick}
                style={{ cursor: 'crosshair', display: 'block' }}
            >
                {/* Outfield Grass (already green bg, but we'll draw a shape to be safe) */}
                <path d="M 0 0 Q 50 -20 100 0 L 100 100 L 0 100 Z" fill="#71be58" />

                {/* Infield Dirt */}
                <path d="M 50 85 L 20 55 L 50 25 L 80 55 Z" fill="#d2b48c" />

                {/* Bases */}
                <rect x="78" y="53" width="4" height="4" fill="white" transform="rotate(45 80 55)" /> {/* First */}
                <rect x="48" y="23" width="4" height="4" fill="white" transform="rotate(45 50 25)" /> {/* Second */}
                <rect x="18" y="53" width="4" height="4" fill="white" transform="rotate(45 20 55)" /> {/* Third */}
                <polygon points="50,83 52,85 50,87 48,85" fill="white" /> {/* Home */}

                {/* Pitcher's Mound */}
                <circle cx="50" cy="55" r="3" fill="#d2b48c" stroke="#b08d6a" />
                <rect x="49" y="54" width="2" height="1" fill="white" />

                {/* Foul Lines */}
                <line x1="50" y1="85" x2="0" y2="35" stroke="white" strokeWidth="0.5" />
                <line x1="50" y1="85" x2="100" y2="35" stroke="white" strokeWidth="0.5" />

                {/* Hit Marker (if selected) */}
                {marker && (
                    <circle cx={marker.x} cy={marker.y} r="2" fill="var(--sd-black)" stroke="var(--sd-white)" strokeWidth="0.5" />
                )}
            </svg>

            <div style={{ position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(255,255,255,0.7)', padding: '5px', borderRadius: '4px', fontSize: '0.8rem', pointerEvents: 'none' }}>
                Tap field to record hit location
            </div>
        </div>
    );
};

export default BaseballField;
