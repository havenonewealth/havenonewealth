import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/server/auth"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }

    // Exchange the auth code for a Supabase session
    const supabase = await getServerSupabase()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error("OAuth exchange error:", error)
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url))
    }

    // Fetch user profile to determine redirect
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user?.email) {
        return NextResponse.redirect(new URL("/login?error=no_user", request.url))
    }

    // Lookup role in your custom table
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single()

    // Default: user dashboard
    let redirectTarget = "/dashboard"

    if (profile?.role === "admin") {
        redirectTarget = "/admin-dashboard"
    }

    return NextResponse.redirect(new URL(redirectTarget, request.url))
}
