import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '' }) => {
    const style = {
        width: '100%',
        padding: '1rem',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '4px',
        color: 'var(--color-text)',
        fontSize: '1rem',
        fontFamily: 'var(--font-main)',
        transition: 'border-color var(--transition-fast)',
        outline: 'none',
    };

    return (
        <input
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className={className}
            style={style}
            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
        />
    );
};

export default Input;
