// Debug endpoint to check configuration
export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const config = {
            hasSupabaseUrl: !!process.env.VITE_SUPABASE_URL,
            hasSupabaseKey: !!process.env.VITE_SUPABASE_ANON_KEY,
            hasBrevoKey: !!process.env.BREVO_API_KEY,
            nodeVersion: process.version,
            platform: process.platform
        };

        return res.status(200).json({
            status: 'ok',
            config,
            message: 'Debug endpoint working'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'error',
            error: error.message
        });
    }
}
