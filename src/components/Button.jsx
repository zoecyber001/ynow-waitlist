import React from 'react';
import '../styles/index.css';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '' }) => {
    const baseStyle = {
        padding: '1rem 2rem',
        fontSize: '1rem',
        fontWeight: 600,
        borderRadius: '4px',
        transition: 'all var(--transition-fast)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
    };

    const variants = {
        primary: {
            backgroundColor: 'var(--color-primary)',
            color: '#000',
            boxShadow: '0 0 15px var(--color-primary-glow)',
        },
        secondary: {
            backgroundColor: 'transparent',
            color: 'var(--color-text)',
            border: '1px solid var(--color-border)',
        },
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`btn-${variant} ${className}`}
            style={{ ...baseStyle, ...variants[variant] }}
            onMouseEnter={(e) => {
                if (variant === 'primary') {
                    e.currentTarget.style.boxShadow = '0 0 25px var(--color-primary-glow)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                }
            }}
            onMouseLeave={(e) => {
                if (variant === 'primary') {
                    e.currentTarget.style.boxShadow = '0 0 15px var(--color-primary-glow)';
                    e.currentTarget.style.transform = 'translateY(0)';
                }
            }}
        >
            {children}
        </button>
    );
};

export default Button;
