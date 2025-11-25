// lib/supabaseClient.ts

import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// These must exist in .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

/*
|--------------------------------------------------------------------------
| Browser Supabase Client (Next.js Pages Router Compatible)
|--------------------------------------------------------------------------
| Replaces deprecated createBrowserSupabaseClient
| Used inside: login, dashboard, admin dashboard, all client components
|--------------------------------------------------------------------------
*/
export const supabase = createPagesBrowserClient({
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
})

/*
|--------------------------------------------------------------------------
| Server Supabase Client
|--------------------------------------------------------------------------
| Used ONLY in server actions, server components, or API routes.
| Matches your server-side usage of createServerClient in lib/server/auth.ts.
|--------------------------------------------------------------------------
*/
export function supabaseServer() {
    return createClient(supabaseUrl, supabaseAnonKey, {
        auth: { persistSession: false },
    })
}

