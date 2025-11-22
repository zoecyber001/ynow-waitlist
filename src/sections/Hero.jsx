import React, { useState, useEffect } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import { supabase } from '../lib/supabase';

const Hero = () => {
    const [inputValue, setInputValue] = useState('');
    const [userType, setUserType] = useState('driver'); // 'driver' | 'mechanic'
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [referralCode, setReferralCode] = useState(null);
    const [error, setError] = useState(null);
    const [referredBy, setReferredBy] = useState(null);
    const [waitlistCount, setWaitlistCount] = useState(2341); // Default fallback

    useEffect(() => {
        // Capture ?ref=CODE from URL
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref');
        if (ref) {
            setReferredBy(ref);
            console.log('Referred by:', ref);
        }

        // Fetch live count
        const fetchCount = async () => {
            const { data, error } = await supabase.rpc('get_waitlist_count');
            if (!error && data) {
                setWaitlistCount(data + 2341); // Add base number to look impressive initially
            }
        };
        fetchCount();
    }, []);

    // Clear input when toggling user type to avoid confusion
    useEffect(() => {
        setInputValue('');
        setError(null);
    }, [userType]);

    const generateReferralCode = () => {
        return Math.random().toString(36).substring(2, 10).toUpperCase();
    };

    const validateInput = (value, type) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^\+?[\d\s-]{8,}$/; // Basic phone validation

        if (type === 'mechanic') {
            // Mechanics MUST use phone
            if (!phoneRegex.test(value)) {
                return { isValid: false, error: 'Please enter a valid WhatsApp number for job alerts.' };
            }
            return { isValid: true, field: 'phone' };
        } else {
            // Drivers can use either
            if (emailRegex.test(value)) return { isValid: true, field: 'email' };
            if (phoneRegex.test(value)) return { isValid: true, field: 'phone' };
            return { isValid: false, error: 'Please enter a valid email or WhatsApp number.' };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!inputValue) return;

        const validation = validateInput(inputValue, userType);
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const newReferralCode = generateReferralCode();

            // Prepare payload based on input type
            const payload = {
                user_type: userType,
                referral_code: newReferralCode,
                referred_by: referredBy
            };
            payload[validation.field] = inputValue; // Set 'email' or 'phone' dynamically

            // Insert into Supabase
            const { error: dbError } = await supabase
                .from('waitlist')
                .insert([payload]);

            if (dbError) {
                if (dbError.code === '23505') { // Unique violation
                    throw new Error(`This ${validation.field} is already on the waitlist!`);
                }
                throw dbError;
            }

            setReferralCode(newReferralCode);
            setIsSubmitted(true);
        } catch (err) {
            console.error('Error joining waitlist:', err);
            setError(err.message || 'Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            padding: 'var(--spacing-lg) var(--spacing-sm)'
        }}>
            {/* Background Effect */}
            <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle at 50% 50%, rgba(20, 20, 20, 1) 0%, rgba(5, 5, 5, 1) 100%)',
                zIndex: -1
            }} />

            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '50px 50px',
                zIndex: -1,
                maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)'
            }} />

            <div className="container" style={{ textAlign: 'center', maxWidth: '800px', zIndex: 1 }}>
                {isSubmitted ? (
                    <div style={{ animation: 'fadeIn 0.5s ease' }}>
                        <div style={{
                            fontSize: '4rem',
                            marginBottom: '1rem',
                            animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                        }}>
                            🎉
                        </div>
                        <h2 style={{
                            fontSize: 'clamp(2rem, 5vw, 3rem)',
                            fontWeight: 700,
                            marginBottom: '1rem'
                        }}>
                            You're on the list!
                        </h2>
                        <p style={{
                            color: 'var(--color-text-muted)',
                            fontSize: '1.2rem',
                            marginBottom: '2rem'
                        }}>
                            We'll notify <strong style={{ color: '#fff' }}>{inputValue}</strong> when we launch.
                        </p>

                        <div style={{
                            background: 'rgba(255,255,255,0.05)',
                            padding: '1.5rem',
                            borderRadius: '12px',
                            border: '1px solid var(--color-border)',
                            maxWidth: '500px',
                            margin: '0 auto'
                        }}>
                            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '0.5rem' }}>
                                Bump your spot by inviting friends:
                            </p>
                            <div style={{
                                display: 'flex',
                                gap: '0.5rem',
                                background: '#000',
                                padding: '0.5rem',
                                borderRadius: '6px',
                                border: '1px solid #333',
                                alignItems: 'center'
                            }}>
                                <code style={{ flex: 1, color: 'var(--color-primary)', fontSize: '0.9rem' }}>
                                    ynow.app/?ref={referralCode}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`ynow.app/?ref=${referralCode}`)}
                                    style={{
                                        color: '#fff',
                                        fontSize: '0.8rem',
                                        padding: '4px 8px',
                                        background: '#333',
                                        borderRadius: '4px'
                                    }}
                                >
                                    Copy
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <>
                        <h1 style={{
                            fontSize: 'clamp(3rem, 8vw, 6rem)',
                            fontWeight: 800,
                            lineHeight: 1.1,
                            marginBottom: 'var(--spacing-md)',
                            letterSpacing: '-0.03em'
                        }}>
                            UBER FOR <br />
                            <span className="text-gradient" style={{
                                background: 'linear-gradient(to right, #fff, #999)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>MECHANICS</span>
                            <span style={{ color: 'var(--color-primary)' }}>.</span>
                        </h1>

                        <p style={{
                            fontSize: 'clamp(1.1rem, 2vw, 1.5rem)',
                            color: 'var(--color-text-muted)',
                            marginBottom: 'var(--spacing-lg)',
                            maxWidth: '600px',
                            marginLeft: 'auto',
                            marginRight: 'auto'
                        }}>
                            Instant bookings. Verified experts. Roadside rescue in minutes.
                            <br />The future of car care is here.
                        </p>

                        {/* Toggle */}
                        <div style={{
                            display: 'inline-flex',
                            background: 'var(--color-surface)',
                            padding: '4px',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            border: '1px solid var(--color-border)'
                        }}>
                            <button
                                onClick={() => setUserType('driver')}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '6px',
                                    background: userType === 'driver' ? 'var(--color-primary)' : 'transparent',
                                    color: userType === 'driver' ? '#000' : 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                I Need a Mechanic
                            </button>
                            <button
                                onClick={() => setUserType('mechanic')}
                                style={{
                                    padding: '0.5rem 1.5rem',
                                    borderRadius: '6px',
                                    background: userType === 'mechanic' ? 'var(--color-primary)' : 'transparent',
                                    color: userType === 'mechanic' ? '#000' : 'var(--color-text-muted)',
                                    fontWeight: 600,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                I Am a Mechanic
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} style={{
                            display: 'flex',
                            gap: '1rem',
                            maxWidth: '500px',
                            margin: '0 auto',
                            flexDirection: 'column'
                        }}>
                            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '250px' }}>
                                    <Input
                                        placeholder={userType === 'driver' ? "Enter email or WhatsApp" : "Enter WhatsApp Number"}
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                    />
                                    {userType === 'mechanic' && (
                                        <p style={{
                                            fontSize: '0.75rem',
                                            color: 'var(--color-primary)',
                                            marginTop: '0.5rem',
                                            textAlign: 'left',
                                            opacity: 0.8
                                        }}>
                                            * Required for instant job dispatch alerts.
                                        </p>
                                    )}
                                </div>
                                <Button type="submit">
                                    {isLoading ? 'Joining...' : (userType === 'driver' ? 'Join Waitlist' : 'Apply Now')}
                                </Button>
                            </div>
                            {error && (
                                <p style={{ color: '#ff4444', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                                    {error}
                                </p>
                            )}

                            {/* Live Counter */}
                            <div style={{
                                marginTop: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                color: 'var(--color-text-muted)',
                                fontSize: '0.9rem'
                            }}>
                                <span style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: '#00FF94',
                                    boxShadow: '0 0 10px #00FF94'
                                }} />
                                <span>
                                    <strong style={{ color: '#fff' }}>{waitlistCount.toLocaleString()}</strong> people waiting.
                                    <span style={{ color: 'var(--color-primary)', marginLeft: '0.5rem' }}>
                                        {userType === 'driver' ? 'Get early access.' : 'Start earning.'}
                                    </span>
                                </span>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </section>
    );
};

export default Hero;
