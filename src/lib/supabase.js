import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Missing Supabase environment variables. Backend features will not work.')
}

// Create a dummy client if keys are missing to prevent crash
export const supabase = (supabaseUrl && supabaseAnonKey)
    ? createClient(supabaseUrl, supabaseAnonKey)
    : {
        from: () => ({
            select: () => ({ eq: () => ({ eq: () => ({ order: () => ({ limit: () => ({ data: [], error: null }) }) }) }) }),
            insert: () => ({ error: null })
        }),
        rpc: () => ({ data: null, error: null })
    }
