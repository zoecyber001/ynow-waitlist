import React from 'react';
import Card from '../components/Card';

const Features = () => {
    const features = [
        {
            title: "Instant Booking",
            description: "Get a qualified mechanic to your location in minutes, not days. Real-time tracking included.",
            icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
            )
        },
        {
            title: "Verified Experts",
            description: "Every mechanic is vetted, certified, and rated by the community. Quality you can trust.",
            icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
            )
        },
        {
            title: "Roadside Rescue",
            description: "Stuck on the highway? Our urgent response team is ready 24/7 to get you back on the road.",
            icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
            )
        }
    ];

    return (
        <section style={{
            padding: 'var(--spacing-xl) var(--spacing-sm)',
            background: 'var(--color-bg)'
        }}>
            <div className="container">
                <div style={{
                    textAlign: 'center',
                    marginBottom: 'var(--spacing-lg)'
                }}>
                    <h2 style={{
                        fontSize: 'clamp(2rem, 5vw, 3rem)',
                        fontWeight: 700,
                        marginBottom: '1rem'
                    }}>
                        Why <span style={{ color: 'var(--color-primary)' }}>YNOW?</span>
                    </h2>
                    <p style={{
                        color: 'var(--color-text-muted)',
                        maxWidth: '600px',
                        margin: '0 auto',
                        fontSize: '1.1rem'
                    }}>
                        We're revolutionizing the auto repair industry with speed, transparency, and technology.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem'
                }}>
                    {features.map((feature, index) => (
                        <Card
                            key={index}
                            title={feature.title}
                            description={feature.description}
                            icon={feature.icon}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Features;
