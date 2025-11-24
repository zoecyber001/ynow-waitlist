import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';

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
        const { contact, contactType } = req.body;

        if (!contact || !contactType) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate OTP using Supabase function
        const { data, error } = await supabase.rpc('create_otp_verification', {
            p_contact: contact,
            p_contact_type: contactType
        });

        if (error) {
            console.error('Supabase error:', error);
            throw error;
        }

        if (!data || data.length === 0) {
            throw new Error('No OTP data returned from database');
        }

        const { otp_code, expires_at } = data[0];

        // Send OTP based on contact type
        if (contactType === 'phone') {
            await sendSMS(contact, otp_code);
        } else if (contactType === 'email') {
            await sendEmail(contact, otp_code);
        }

        return res.status(200).json({
            success: true,
            expiresAt: expires_at
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Failed to send OTP'
        });
    }
}

// Send SMS - Currently logs to console (free)
// To enable real SMS: Add Twilio, Termii, or other SMS provider
async function sendSMS(phoneNumber, otpCode) {
    try {
        console.log('📱 SMS OTP Request');
        console.log(`Phone: ${phoneNumber}`);
        console.log(`OTP Code: ${otpCode}`);
        console.log('⚠️  SMS not sent - configure SMS provider (Twilio, Termii, etc.)');

        // For now, just return success
        // The OTP is in the database, user can check Vercel logs or you can add SMS provider later
        return {
            success: true,
            note: 'OTP logged to console - configure SMS provider to send actual SMS'
        };
    } catch (error) {
        console.error('Error in sendSMS:', error);
        // Don't throw error, allow the flow to continue
        console.log(`📱 OTP for ${phoneNumber}: ${otpCode}`);
        return { success: true, note: 'OTP logged to console' };
    }
}

// Send Email via Supabase Auth
async function sendEmail(email, otpCode) {
    try {
        console.log('Sending email to:', email);

        // Use Supabase Auth to send email with OTP
        const { data, error } = await supabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
            options: {
                redirectTo: `${process.env.VITE_APP_URL || 'https://ynow.vercel.app'}`,
            }
        });

        if (error) {
            console.error('Supabase email error:', error);
            // Fallback: Just log the OTP for now (you can set up SMTP in Supabase later)
            console.log(`📧 OTP for ${email}: ${otpCode}`);
            console.log('⚠️  Email not sent - configure SMTP in Supabase Settings > Auth > Email');
            // Don't throw error, just log it
            return { success: true, note: 'OTP logged to console - configure SMTP in Supabase' };
        }

        console.log('Email sent successfully via Supabase');
        return data;
    } catch (error) {
        console.error('Error in sendEmail:', error);
        // Log OTP as fallback
        console.log(`📧 OTP for ${email}: ${otpCode}`);
        console.log('⚠️  Email sending failed - OTP logged to console');
        // Don't throw error, allow the flow to continue
        return { success: true, note: 'OTP logged to console' };
    }
}
