import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get("code")

    if (!code) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=missing_code`)
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
                    cookieStore.set(name, value, options)
                },
                remove(name: string, options: any) {
                    cookieStore.set(name, "", { ...options, maxAge: 0 })
                }
            }
        }
    )

    const { error: exchangeError } =
        await supabase.auth.exchangeCodeForSession(code)

    if (exchangeError) {
        console.error("OAuth exchange failed:", exchangeError)
        return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`)
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user?.email) {
        return NextResponse.redirect(`${requestUrl.origin}/login?error=no_user`)
    }

    // fetch role
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .maybeSingle()

    const redirectTo = profile?.role === "admin"
        ? "/admin-dashboard"
        : "/dashboard"

    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
}
