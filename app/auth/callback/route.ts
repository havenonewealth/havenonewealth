import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", request.url))
    }

    const cookieStore = await cookies()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookieStore.get(name)?.value
                },
                set(name: string, value: string, options: any) {
                    cookieStore.set({ name, value, ...options })
                },
                remove(name: string, options: any) {
                    cookieStore.delete({ name, ...options })
                }
            }
        }
    )

    // Exchange code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error("OAuth exchange error:", error)
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url))
    }

    // Get the logged-in user
    const {
        data: { user }
    } = await supabase.auth.getUser()

    if (!user?.email) {
        return NextResponse.redirect(new URL("/login?error=no_user", request.url))
    }

    // Look up role
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single()

    // Redirect admins to admin dashboard
    if (profile?.role === "admin") {
        return NextResponse.redirect("https://havenonewealth.vercel.app/admin-dashboard")
    }

    // Everyone else to dashboard
    return NextResponse.redirect("https://havenonewealth.vercel.app/dashboard")
}
