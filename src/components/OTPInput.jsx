import React, { useState, useRef, useEffect } from 'react';

const OTPInput = ({ length = 6, onComplete, onResend, isLoading, error }) => {
    const [otp, setOtp] = useState(new Array(length).fill(''));
    const [resendTimer, setResendTimer] = useState(0);
    const inputRefs = useRef([]);

    useEffect(() => {
        // Auto-focus first input on mount
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }

        // Start resend timer (60 seconds)
        setResendTimer(60);
    }, []);

    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendTimer]);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Auto-focus next input
        if (element.value && index < length - 1) {
            inputRefs.current[index + 1].focus();
        }

        // Auto-submit when all fields are filled
        if (newOtp.every(digit => digit !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (e, index) => {
        // Handle backspace
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                inputRefs.current[index - 1].focus();
            }
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, length);

        if (!/^\d+$/.test(pastedData)) return;

        const newOtp = pastedData.split('');
        setOtp([...newOtp, ...new Array(length - newOtp.length).fill('')]);

        // Focus last filled input or first empty
        const focusIndex = Math.min(pastedData.length, length - 1);
        inputRefs.current[focusIndex].focus();

        // Auto-submit if complete
        if (pastedData.length === length) {
            onComplete(pastedData);
        }
    };

    const handleResend = () => {
        setOtp(new Array(length).fill(''));
        setResendTimer(60);
        inputRefs.current[0].focus();
        onResend();
    };

    return (
        <div style={{ width: '100%' }}>
            <div style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                marginBottom: '1.5rem'
            }}>
                {otp.map((digit, index) => (
                    <input
                        key={index}
                        ref={el => inputRefs.current[index] = el}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={e => handleChange(e.target, index)}
                        onKeyDown={e => handleKeyDown(e, index)}
                        onPaste={handlePaste}
                        disabled={isLoading}
                        style={{
                            width: '3rem',
                            height: '3.5rem',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            border: '2px solid var(--color-border)',
                            borderRadius: '8px',
                            background: 'var(--color-surface)',
                            color: '#fff',
                            transition: 'all 0.2s ease',
                            outline: 'none',
                            ...(digit && {
                                borderColor: 'var(--color-primary)',
                                boxShadow: '0 0 0 1px var(--color-primary)'
                            })
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = 'var(--color-primary)';
                            e.target.style.boxShadow = '0 0 0 1px var(--color-primary)';
                        }}
                        onBlur={(e) => {
                            if (!digit) {
                                e.target.style.borderColor = 'var(--color-border)';
                                e.target.style.boxShadow = 'none';
                            }
                        }}
                    />
                ))}
            </div>

            {error && (
                <p style={{
                    color: '#ff4444',
                    fontSize: '0.9rem',
                    marginBottom: '1rem',
                    textAlign: 'center'
                }}>
                    {error}
                </p>
            )}

            <div style={{
                textAlign: 'center',
                fontSize: '0.9rem',
                color: 'var(--color-text-muted)'
            }}>
                {resendTimer > 0 ? (
                    <p>
                        Didn't receive the code?{' '}
                        <span style={{ color: 'var(--color-primary)' }}>
                            Resend in {resendTimer}s
                        </span>
                    </p>
                ) : (
                    <button
                        onClick={handleResend}
                        disabled={isLoading}
                        style={{
                            background: 'transparent',
                            color: 'var(--color-primary)',
                            textDecoration: 'underline',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                    >
                        Resend OTP
                    </button>
                )}
            </div>
        </div>
    );
};

export default OTPInput;
