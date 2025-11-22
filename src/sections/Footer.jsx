import React from 'react';

const Footer = () => {
    return (
        <footer style={{
            padding: '2rem',
            textAlign: 'center',
            borderTop: '1px solid var(--color-border)',
            color: 'var(--color-text-muted)',
            marginTop: 'auto'
        }}>
            <p>&copy; {new Date().getFullYear()} YNOW. All rights reserved.</p>
        </footer>
    );
};

export default Footer;
