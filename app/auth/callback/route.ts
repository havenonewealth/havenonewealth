import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
    }

    // Create a response object for Supabase to attach cookies to
    const response = NextResponse.next();

    // Supabase client
    const supabase = await createClient();

    // Exchange code for session (one-argument signature)
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("OAuth exchange error:", error);
        return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
    }

    // Fetch user
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return NextResponse.redirect(new URL("/login?error=no_user", request.url));
    }

    // Lookup user role
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single();

    const redirectTo =
        profile?.role === "admin" ? "/admin-dashboard" : "/dashboard";

    const redirectResponse = NextResponse.redirect(
        new URL(redirectTo, request.url)
    );

    // Copy cookies that Supabase wrote into `response`
    response.cookies.getAll().forEach((cookie) => {
        redirectResponse.cookies.set({
            name: cookie.name,
            value: cookie.value,
        });
    });

    return redirectResponse;
}
