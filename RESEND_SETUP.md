# Resend Email OTP Setup Guide

## 🎯 Quick Setup

### 1. Sign Up for Resend (FREE)

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Free tier includes **3,000 emails/month** ✅

### 2. Get API Key

1. After signing in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "YNOW Waitlist")
4. Copy the API key (starts with `re_...`)

### 3. Add to Environment

Add to your `.env` file:

```bash
VITE_RESEND_API_KEY=re_your_actual_api_key_here
```

### 4. (Optional) Add Custom Domain

By default, emails are sent from `onboarding@resend.dev`. To use your own domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `ynow.app`)
4. Add the DNS records shown
5. Wait for verification (usually 5-10 minutes)
6. Update `otpService.js`:
   ```javascript
   from: 'YNOW <noreply@ynow.app>'
   ```

## 📧 Email Template

The OTP email includes:
- ✅ YNOW branding with your brand colors (#00FF94)
- ✅ Large, easy-to-read OTP code
- ✅ Dark theme matching your website
- ✅ Mobile-responsive design
- ✅ Security reminder text

## 🧪 Testing

### Test Email Delivery:

1. Start dev server: `npm run dev`
2. Enter your email address
3. Check your inbox for the OTP email
4. Enter the 6-digit code
5. Verify signup success

### Email Preview:

The email will look like this:

```
┌─────────────────────────────┐
│         YNOW                │
│                             │
│  Your verification code is: │
│                             │
│  ┌───────────────────────┐  │
│  │      123456           │  │
│  └───────────────────────┘  │
│                             │
│  This code expires in       │
│  5 minutes.                 │
│                             │
│  Don't share this code      │
│  with anyone.               │
└─────────────────────────────┘
```

## 💰 Pricing

| Tier | Emails/Month | Cost |
|------|--------------|------|
| Free | 3,000 | $0 |
| Pro | 50,000 | $20 |
| Enterprise | Custom | Custom |

For a waitlist, the free tier is more than enough!

## 🔧 Customization

### Change Email Content

Edit `src/services/otpService.js`:

```javascript
subject: 'Your Custom Subject',
html: `your custom HTML template`
```

### Change Sender Name

```javascript
from: 'Your App <noreply@yourdomain.com>'
```

## 🐛 Troubleshooting

### Email not received?
- Check spam folder
- Verify API key is correct
- Check Resend dashboard for delivery status
- Ensure email address is valid

### Using custom domain?
- Verify DNS records are added correctly
- Wait 5-10 minutes for DNS propagation
- Check domain verification status in Resend dashboard

### Rate limiting?
- Free tier: 3,000 emails/month
- If exceeded, upgrade to Pro plan

## 📊 Monitoring

View email delivery stats in Resend dashboard:
- Sent emails
- Delivery rate
- Bounce rate
- Open rate (if tracking enabled)
