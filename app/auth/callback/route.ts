import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", request.url));
  }

  const response = NextResponse.next();
  const supabase = createClient({ request, response });

  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

  if (exchangeError) {
    return NextResponse.redirect(new URL("/login?error=oauth_failed", request.url));
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.id) {
    return NextResponse.redirect(new URL("/login?error=no_user", request.url));
  }

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  const redirectTo = profile?.role === "admin"
    ? "/admin-dashboard"
    : "/dashboard";

  const finalResponse = NextResponse.redirect(new URL(redirectTo, request.url));

  response.cookies.getAll().forEach((cookie) =>
    finalResponse.cookies.set(cookie)
  );

  return finalResponse;
}
