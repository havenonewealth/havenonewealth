// app/auth/callback/route.ts
import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_code`)
    }

    // MUST AWAIT — this was causing the 500
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

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
        console.error("OAuth exchange error:", error)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
    }

    // Get the user
    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`)
    }

    // Get role
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single()

    const redirectPath = profile?.role === "admin"
        ? "/admin-dashboard"
        : "/dashboard"

    return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`)
}
