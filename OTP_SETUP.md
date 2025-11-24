# OTP Verification Setup Guide

## 🚀 Quick Setup

### 1. Database Migration

Run the SQL migration in your Supabase dashboard:

1. Go to your Supabase project → SQL Editor
2. Copy and paste the contents of `schema_otp.sql`
3. Click "Run" to execute

This will create:
- `otp_verifications` table
- OTP generation and verification functions
- Cleanup functions for expired OTPs
- Updated `waitlist` table with verification fields

### 2. Get Sendchamp API Key (FREE)

1. Sign up at [Sendchamp](https://sendchamp.com)
2. Navigate to Settings → API Keys
3. Copy your API key

### 3. Add Environment Variable

Add your Sendchamp API key to `.env`:

```bash
VITE_SENDCHAMP_API_KEY=your_actual_api_key_here
```

### 4. Test the Flow

1. Start dev server: `npm run dev`
2. Enter a phone number (use your own for testing)
3. Check your phone for the OTP SMS
4. Enter the 6-digit code
5. Verify you're added to the waitlist

## 📱 How It Works

### User Flow:
1. **Enter Contact** → User enters email or phone
2. **Send OTP** → 6-digit code sent via SMS (FREE with Sendchamp)
3. **Verify Code** → User enters code
4. **Add to Waitlist** → Only verified contacts are added

### Cost Breakdown:
- **Sending OTP SMS**: ₦0.00 (FREE) ✅
- **Verification**: Done in our database (FREE) ✅
- **Total per signup**: ₦0.00 🎉

## 🔒 Security Features

- **5-minute expiration** on OTP codes
- **3 attempts max** per OTP
- **Rate limiting** built into database functions
- **Verified flag** ensures only real contacts

## 📝 Customization

### Change OTP Length
In `src/components/OTPInput.jsx`:
```javascript
<OTPInput length={6} /> // Change to 4, 6, or 8
```

### Change Expiration Time
In `schema_otp.sql`:
```sql
v_expires_at := now() + interval '5 minutes'; -- Change to '10 minutes', etc.
```

### Change SMS Message
In `src/services/otpService.js`:
```javascript
message: `Your YNOW verification code is: ${otpCode}...`
```

## 🐛 Troubleshooting

### SMS not received?
- Check phone number format (include country code: +234...)
- Verify Sendchamp API key is correct
- Check Sendchamp dashboard for delivery status

### OTP expired?
- Default expiration is 5 minutes
- User can click "Resend OTP" to get a new code

### Database errors?
- Ensure `schema_otp.sql` was run successfully
- Check Supabase logs for specific errors

## 🎨 Email OTP (Optional)

For email verification, you have two options:

1. **Supabase Auth** (recommended):
   - Use Supabase's built-in email templates
   - Configure in Supabase Dashboard → Authentication → Email Templates

2. **Custom Email Service**:
   - Integrate SendGrid, Resend, or similar
   - Update `sendEmailOTP()` in `otpService.js`

Currently, email OTP is logged to console for testing.
