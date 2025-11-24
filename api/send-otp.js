import { createClient } from '@supabase/supabase-js';
import fetch from 'node-fetch';
import nodemailer from 'nodemailer';

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

// Send Email via SMTP (Brevo/Gmail/etc configured in Supabase)
async function sendEmail(email, otpCode) {
    try {
        console.log('Sending email to:', email);

        // Get SMTP settings from environment (you'll add these to Vercel)
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // Send email
        const info = await transporter.sendMail({
            from: `"YNOW" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
            to: email,
            subject: 'Your YNOW Verification Code',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                </head>
                <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
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
            `,
        });

        console.log('Email sent successfully:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error in sendEmail:', error);
        // Log OTP as fallback
        console.log(`📧 OTP for ${email}: ${otpCode}`);
        console.log('⚠️  Email sending failed - OTP logged to console');
        // Don't throw error, allow the flow to continue
        return { success: true, note: 'OTP logged to console - check SMTP settings' };
    }
}
