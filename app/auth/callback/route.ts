import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");

    if (!code) {
        return NextResponse.redirect("/login?error=missing_code");
    }

    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
        console.error("OAuth exchange error:", error);
        return NextResponse.redirect("/login?error=oauth_failed");
    }

    // Fetch user
    const {
        data: { user }
    } = await supabase.auth.getUser();

    if (!user?.email) {
        return NextResponse.redirect("/login?error=no_user");
    }

    // Lookup role
    const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("email", user.email)
        .single();

    const redirectTo =
        profile?.role === "admin" ? "/admin-dashboard" : "/dashboard";

    return NextResponse.redirect(redirectTo);
}
