# 🔒 OTP Security Fix - IMPORTANT

## ⚠️ Security Issue (FIXED)

**Problem**: API keys were exposed to the browser because they used the `VITE_` prefix.

**Solution**: Moved API keys to serverless functions (server-side only).

---

## 🏗️ What Changed

### 1. Created Serverless API Routes

**New Files:**
- `api/send-otp.js` - Handles OTP generation and sending (SMS/Email)
- `api/verify-otp.js` - Handles OTP verification

These run on Vercel's serverless infrastructure, keeping API keys secure.

### 2. Updated OTP Service

**Modified:** `src/services/otpService.js`
- Now calls `/api/send-otp` and `/api/verify-otp` endpoints
- No longer exposes API keys to the browser

### 3. Updated Environment Variables

**Changed in `.env.example`:**
```diff
- VITE_SENDCHAMP_API_KEY=your_key
- VITE_RESEND_API_KEY=your_key
+ SENDCHAMP_API_KEY=your_key
+ RESEND_API_KEY=your_key
```

**Why?**
- `VITE_` prefix = exposed to browser (PUBLIC)
- No prefix = server-side only (SECURE) ✅

---

## 🔐 Environment Variable Rules

| Variable | Prefix | Visibility | Use Case |
|----------|--------|------------|----------|
| `VITE_SUPABASE_URL` | ✅ VITE_ | Public | Client-side Supabase init |
| `VITE_SUPABASE_ANON_KEY` | ✅ VITE_ | Public | Client-side Supabase (protected by RLS) |
| `SENDCHAMP_API_KEY` | ❌ No prefix | Server-only | Sending SMS securely |
| `RESEND_API_KEY` | ❌ No prefix | Server-only | Sending emails securely |

---

## ✅ What You Need to Do

### 1. Update Your `.env` File

Remove the `VITE_` prefix from sensitive keys:

```bash
# ✅ Public (keep VITE_ prefix)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# ✅ Server-only (NO VITE_ prefix)
SENDCHAMP_API_KEY=your_sendchamp_key
RESEND_API_KEY=your_resend_key
```

### 2. Update Vercel Environment Variables

In your Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add these variables (without `VITE_` prefix):
   - `SENDCHAMP_API_KEY` = your_sendchamp_key
   - `RESEND_API_KEY` = your_resend_key
3. Keep these with `VITE_` prefix:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### 3. Redeploy

After updating environment variables in Vercel, redeploy your app.

---

## 🧪 Testing

The OTP flow works exactly the same, but now it's secure:

1. User enters email/phone
2. Frontend calls `/api/send-otp` (serverless function)
3. Serverless function uses API keys (secure, server-side)
4. OTP sent via SMS/Email
5. User enters OTP
6. Frontend calls `/api/verify-otp` (serverless function)
7. Verification happens securely

---

## 🔍 How to Verify It's Secure

1. Open your deployed site
2. Open browser DevTools → Network tab
3. Sign up with email/phone
4. Check the network requests:
   - ✅ You should see calls to `/api/send-otp`
   - ✅ You should NOT see Sendchamp/Resend API keys in the request
   - ✅ API keys are only in the serverless function (server-side)

---

## 📚 Why This Matters

**Before (INSECURE):**
```javascript
// ❌ API key exposed in browser
const API_KEY = import.meta.env.VITE_SENDCHAMP_API_KEY;
fetch('https://api.sendchamp.com/...', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }
});
```

Anyone could:
- View source code
- See your API key
- Use it to send unlimited SMS/emails on your account 💸

**After (SECURE):**
```javascript
// ✅ API key stays on server
fetch('/api/send-otp', {
  body: JSON.stringify({ contact, contactType })
});
```

API keys are only in serverless functions, never exposed to users.

---

## 🎯 Summary

✅ **API keys are now secure** (server-side only)  
✅ **No code changes needed in your app** (same functionality)  
✅ **Just update environment variables** (remove VITE_ prefix)  
✅ **Vercel warning will disappear** after redeployment
