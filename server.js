import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Import API handlers dynamically to ensure dotenv is loaded first
// import sendOtpHandler from './api/send-otp.js';
// import verifyOtpHandler from './api/verify-otp.js';

// Routes
app.post('/api/send-otp', async (req, res) => {
    console.log('POST /api/send-otp');
    try {
        const { default: sendOtpHandler } = await import('./api/send-otp.js');
        await sendOtpHandler(req, res);
    } catch (error) {
        console.error('Error in send-otp handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

app.post('/api/verify-otp', async (req, res) => {
    console.log('POST /api/verify-otp');
    try {
        const { default: verifyOtpHandler } = await import('./api/verify-otp.js');
        await verifyOtpHandler(req, res);
    } catch (error) {
        console.error('Error in verify-otp handler:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`
    🚀 Local API Server running at http://localhost:${PORT}
    👉 OTP Endpoint: http://localhost:${PORT}/api/send-otp
    👉 Verify Endpoint: http://localhost:${PORT}/api/verify-otp
    `);
});
