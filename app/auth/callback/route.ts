import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(req: Request) {
    try {
        // In your Next.js version cookies() is sync, so no await
        const cookieStore = cookies()

        const supabase = createRouteHandlerClient({
            cookies: async () => cookieStore   // MUST return a Promise
        })

        const url = new URL(req.url)
        const code = url.searchParams.get("code")

        if (!code) {
            return NextResponse.redirect(new URL("/login?error=missing_code", req.url))
        }

        // Exchange code for session
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("Auth error:", error)
            return NextResponse.redirect(new URL("/login?error=auth_failed", req.url))
        }

        // Get session user
        const { data: { user } } = await supabase.auth.getUser()

        if (!user?.email) {
            return NextResponse.redirect(new URL("/login?error=no_user", req.url))
        }

        // Redirect all users to dashboard (keep simple for now)
        return NextResponse.redirect(new URL("/dashboard", req.url))

    } catch (err) {
        console.error("Callback fatal error:", err)
        return NextResponse.redirect(new URL("/login?error=callback_crash", req.url))
    }
}
