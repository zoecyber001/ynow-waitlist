const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');

// Initialize Supabase client
const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
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
};

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

// Send Email via Resend
async function sendEmail(email, otpCode) {
    try {
        // Check if API key exists
        if (!process.env.RESEND_API_KEY) {
            throw new Error('RESEND_API_KEY is not configured in environment variables');
        }

        console.log('Sending email to:', email);

        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: 'YNOW <onboarding@resend.dev>',
                to: email,
                subject: 'Your YNOW Verification Code',
                html: `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    </head>
                    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
                        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
                            <tr>
                                <td align="center">
                                    <table width="600" cellpadding="0" cellspacing="0" style="background-color: #1a1a1a; border-radius: 12px; border: 1px solid #333;">
                                        <tr>
                                            <td style="padding: 40px; text-align: center;">
                                                <h1 style="color: #00FF94; margin: 0 0 20px 0; font-size: 28px; font-weight: 800;">YNOW</h1>
                                                <p style="color: #888; margin: 0 0 30px 0; font-size: 16px;">Your verification code is:</p>
                                                <div style="background-color: #0a0a0a; border: 2px solid #00FF94; border-radius: 8px; padding: 20px; margin: 0 0 30px 0;">
                                                    <span style="color: #00FF94; font-size: 36px; font-weight: bold; letter-spacing: 8px;">${otpCode}</span>
                                                </div>
                                                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">This code expires in 5 minutes.</p>
                                                <p style="color: #666; margin: 0; font-size: 14px;">Don't share this code with anyone.</p>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td style="padding: 20px 40px; border-top: 1px solid #333; text-align: center;">
                                                <p style="color: #555; margin: 0; font-size: 12px;">If you didn't request this code, you can safely ignore this email.</p>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </body>
                    </html>
                `
            })
        });

        console.log('Resend response status:', response.status);

        // Get response text first
        const responseText = await response.text();
        console.log('Resend response:', responseText);

        // Try to parse as JSON
        let data;
        try {
            data = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse Resend response as JSON:', responseText);
            throw new Error(`Invalid response from email provider: ${responseText.substring(0, 100)}`);
        }

        if (!response.ok) {
            console.error('Resend error:', data);
            throw new Error(data.message || `Email API error: ${response.status}`);
        }

        console.log('Email sent successfully');
        return data;
    } catch (error) {
        console.error('Error in sendEmail:', error);
        throw error;
    }
}
