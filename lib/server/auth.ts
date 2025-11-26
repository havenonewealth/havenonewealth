import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

export function getServerSupabase() {
    // cookies() is sync in your version
    const cookieStore = cookies()

    return createServerComponentClient({
        cookies: async () => cookieStore   // must be async to satisfy TS type
    })
}
