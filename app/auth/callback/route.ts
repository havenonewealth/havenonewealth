import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/server/auth"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_code`)
    }

    // Create server client
    const supabase = await getServerSupabase()

    // IMPORTANT:
    // Pass the FULL URL, not just the code
    const { error } = await supabase.auth.exchangeCodeForSession(requestUrl.toString())

    if (error) {
        console.error("OAuth exchange error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
    }

    // Get the logged-in user
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user?.email) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`)
    }

    // Lookup role to determine redirect destination
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single()

    // Set redirect target
    const redirectTarget =
        profile?.role === "admin" ? "/admin-dashboard" : "/dashboard"

    return NextResponse.redirect(`${requestUrl.origin}${redirectTarget}`)
}
