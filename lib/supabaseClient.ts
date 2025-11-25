// lib/supabaseClient.ts
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// These must exist in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// ----------
// Browser client (used in dashboard, login, etc.)
// ----------
export const supabase = createBrowserSupabaseClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
})

// ----------
// Server client (if ever needed)
// ----------
export const supabaseServer = () =>
    createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
    })
