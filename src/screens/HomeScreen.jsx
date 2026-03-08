import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, PlayCircle } from 'lucide-react';

const HomeScreen = () => {
    const navigate = useNavigate();

    return (
        <div className="welcome-card text-center">
            <h2>Welcome to StatsDonkey</h2>
            <p style={{ marginBottom: '2rem' }}>The deepest Slo-Pitch tracker.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <button className="primary-btn flex-center" onClick={() => navigate('/team')} style={{ gap: '0.5rem' }}>
                    <Users size={20} /> Manage My Team
                </button>

                <button className="primary-btn flex-center" onClick={() => navigate('/opponents')} style={{ gap: '0.5rem', backgroundColor: 'var(--sd-white)', color: 'var(--sd-black)' }}>
                    <Shield size={20} /> Opponents
                </button>

                <button className="primary-btn flex-center" onClick={() => navigate('/setup')} style={{ marginTop: '1rem', gap: '0.5rem', backgroundColor: 'var(--sd-black)', color: 'var(--sd-white)' }}>
                    <PlayCircle size={20} /> Start New Game
                </button>
                <button className="primary-btn flex-center" onClick={() => navigate('/stats')} style={{ gap: '0.5rem', backgroundColor: 'var(--sd-beige)', color: 'var(--sd-black)', border: '2px solid var(--sd-black)' }}>
                    View Team Stats
                </button>
            </div>
        </div>
    );
};

export default HomeScreen;
