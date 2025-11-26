import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET(request: Request) {
    try {
        const requestUrl = new URL(request.url)
        const code = requestUrl.searchParams.get("code")

        if (!code) {
            return NextResponse.redirect("/login?error=missing_code")
        }

        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (error) {
            console.error("exchangeCodeForSession error:", error)
            return NextResponse.redirect("/login?error=exchange_failed")
        }

        return NextResponse.redirect("/admin-dashboard")
    } catch (e) {
        console.error("callback_crash:", e)
        return NextResponse.redirect("/login?error=callback_crash")
    }
}
