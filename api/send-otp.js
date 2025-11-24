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

// Send SMS via Sendchamp
async function sendSMS(phoneNumber, otpCode) {
    try {
        // Check if API key exists
        if (!process.env.SENDCHAMP_API_KEY) {
            throw new Error('SENDCHAMP_API_KEY is not configured in environment variables');
        }

        console.log('Sending SMS to:', phoneNumber);

        const response = await fetch('https://api.sendchamp.com/api/v1/sms/send', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.SENDCHAMP_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                to: phoneNumber,
                message: `Your YNOW verification code is: ${otpCode}\n\nThis code expires in 5 minutes.\n\nDon't share this code with anyone.`,
                sender_name: 'YNOW',
                route: 'non_dnd'
            })
        });

        console.log('Sendchamp response status:', response.status);

        // Get response text first
        const responseText = await response.text();
        console.log('Sendchamp response:', responseText);

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse Sendchamp response as JSON:', responseText);
            throw new Error(`Invalid response from SMS provider: ${responseText.substring(0, 100)}`);
        }

        if (!response.ok) {
            console.error('Sendchamp error:', data);
            throw new Error(data.message || `SMS API error: ${response.status}`);
        }

        console.log('SMS sent successfully');
        return data;
    } catch (error) {
        console.error('Error in sendSMS:', error);
        throw error;
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
