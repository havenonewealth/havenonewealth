import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");

        if (!code) {
            return NextResponse.redirect("/login?error=missing_code");
        }

        const cookieStore = cookies();

        const supabase = createRouteHandlerClient({
            cookies: () => cookieStore
        });

        // Exchange code for session
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
            console.error("Auth exchange error:", error);
            return NextResponse.redirect("/login?error=oauth_failed");
        }

        // Retrieve user
        const {
            data: { user }
        } = await supabase.auth.getUser();

        if (!user?.email) {
            return NextResponse.redirect("/login?error=no_user");
        }

        // Lookup the user in your users table
        const { data: profile, error: profileError } = await supabase
            .from("users")
            .select("role")
            .eq("email", user.email)
            .single();

        if (profileError) {
            console.error("User profile error:", profileError);
        }

        // Default redirect
        let redirectTo = "/dashboard";

        if (profile?.role === "admin") {
            redirectTo = "/admin-dashboard";
        }

        return NextResponse.redirect(redirectTo);

    } catch (err) {
        console.error("Callback route error:", err);
        return NextResponse.redirect("/login?error=server_error");
    }
}
