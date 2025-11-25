import { supabase } from '../lib/supabase';

// Use local server URL when in development mode
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:3000'
    : '';

/**
 * OTP Service for handling verification logic
 * Now uses serverless API routes to keep API keys secure
 */
export const otpService = {
    /**
     * Generate and send OTP to email or phone
     */
    async sendOTP(contact, contactType) {
        try {
            // Call serverless API route instead of direct API call
            const response = await fetch(`${API_BASE_URL}/api/send-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact,
                    contactType
                })
            });

            // Try to parse as JSON, but handle non-JSON responses
            let data;
            const contentType = response.headers.get('content-type');

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                // Non-JSON response (likely an error page)
                const text = await response.text();
                console.error('Non-JSON response:', text);
                throw new Error(`Server error: ${text.substring(0, 200)}`);
            }

            if (!response.ok) {
                throw new Error(data.error || 'Failed to send OTP');
            }

            return {
                success: true,
                expiresAt: data.expiresAt
            };
        } catch (error) {
            console.error('Error sending OTP:', error);
            return {
                success: false,
                error: error.message || 'Failed to send OTP'
            };
        }
    },

    /**
     * Verify OTP code
     */
    async verifyOTP(contact, otpCode) {
        try {
            // Call serverless API route instead of direct database call
            const response = await fetch(`${API_BASE_URL}/api/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contact,
                    otpCode
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify OTP');
            }

            return {
                success: data.success,
                message: data.message
            };
        } catch (error) {
            console.error('Error verifying OTP:', error);
            return {
                success: false,
                message: error.message || 'Failed to verify OTP'
            };
        }
    },

    /**
     * Check if contact has been verified
     */
    async isContactVerified(contact) {
        try {
            const { data, error } = await supabase
                .from('otp_verifications')
                .select('verified')
                .eq('contact', contact)
                .eq('verified', true)
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) throw error;

            return data && data.length > 0;
        } catch (error) {
            console.error('Error checking verification:', error);
            return false;
        }
    }
};
