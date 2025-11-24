import { supabase } from '../lib/supabase';

const SENDCHAMP_API_KEY = import.meta.env.VITE_SENDCHAMP_API_KEY;
const SENDCHAMP_API_URL = 'https://api.sendchamp.com/api/v1/sms/send';

/**
 * OTP Service for handling verification logic
 */
export const otpService = {
    /**
     * Generate and send OTP to email or phone
     */
    async sendOTP(contact, contactType) {
        try {
            // Call Supabase function to generate OTP
            const { data, error } = await supabase.rpc('create_otp_verification', {
                p_contact: contact,
                p_contact_type: contactType
            });

            if (error) throw error;

            const { otp_code, expires_at } = data[0];

            // Send OTP based on contact type
            if (contactType === 'email') {
                await this.sendEmailOTP(contact, otp_code);
            } else if (contactType === 'phone') {
                await this.sendSMSOTP(contact, otp_code);
            }

            return {
                success: true,
                expiresAt: expires_at
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
     * Send OTP via SMS using Sendchamp
     */
    async sendSMSOTP(phoneNumber, otpCode) {
        try {
            const response = await fetch(SENDCHAMP_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${SENDCHAMP_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: phoneNumber,
                    message: `Your YNOW verification code is: ${otpCode}\n\nThis code expires in 5 minutes.\n\nDon't share this code with anyone.`,
                    sender_name: 'YNOW',
                    route: 'non_dnd' // Use non-DND route for better delivery
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send SMS');
            }

            return { success: true };
        } catch (error) {
            console.error('Sendchamp SMS error:', error);
            throw error;
        }
    },

    /**
     * Send OTP via Email using Resend
     */
    async sendEmailOTP(email, otpCode) {
        try {
            const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;

            const response = await fetch('https://api.resend.com/emails', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${RESEND_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    from: 'YNOW <onboarding@resend.dev>', // Change to your verified domain
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

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send email');
            }

            return { success: true };
        } catch (error) {
            console.error('Resend email error:', error);
            throw error;
        }
    },

    /**
     * Verify OTP code
     */
    async verifyOTP(contact, otpCode) {
        try {
            const { data, error } = await supabase.rpc('verify_otp', {
                p_contact: contact,
                p_otp_code: otpCode
            });

            if (error) throw error;

            const { success, message } = data[0];

            return {
                success,
                message
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
