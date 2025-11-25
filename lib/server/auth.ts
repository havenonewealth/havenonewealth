"use server"

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function getServerSupabase() {
    // Your environment: cookies() returns a Promise → MUST AWAIT
    const cookieStore = await cookies()

    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true,
            },
            global: {
                fetch: (...args) => fetch(...args),
            },
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                // Next.js App Router does not allow modifying cookies inside server actions
                set() {
                    /* ignored */
                },
                remove() {
                    /* ignored */
                },
            },
        }
    )
}
