import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { contact, otpCode } = req.body;

        if (!contact || !otpCode) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify OTP using Supabase function
        const { data, error } = await supabase.rpc('verify_otp', {
            p_contact: contact,
            p_otp_code: otpCode
        });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('No verification data returned from database');
        }

        const { success, message } = data[0];

        return res.status(200).json({
            success,
            message
        });
    } catch (error) {
        console.error('Error verifying OTP:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Failed to verify OTP'
        });
    }
}
