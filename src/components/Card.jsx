import React from 'react';

const Card = ({ title, description, icon, className = '' }) => {
    return (
        <div
            className={className}
            style={{
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                padding: '2rem',
                transition: 'transform 0.3s ease, border-color 0.3s ease',
                cursor: 'default',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--color-primary)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
            }}
        >
            <div style={{
                fontSize: '2rem',
                marginBottom: '1rem',
                color: 'var(--color-primary)'
            }}>
                {icon}
            </div>
            <h3 style={{
                fontSize: '1.5rem',
                fontWeight: 600,
                marginBottom: '0.5rem',
                color: 'var(--color-text)'
            }}>
                {title}
            </h3>
            <p style={{
                color: 'var(--color-text-muted)',
                lineHeight: 1.6
            }}>
                {description}
            </p>
        </div>
    );
};

export default Card;
