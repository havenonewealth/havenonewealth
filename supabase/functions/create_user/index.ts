import { serve } from "https://deno.land/std@0.224.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req) => {
  try {
    const { email, role } = await req.json()

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { status: 400 }
      )
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // 1. Create auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        email_confirm: true
      })

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400
      })
    }

    // 2. Insert into metadata table
    const { error: profileError } = await supabase
      .from("users")
      .insert({
        id: authUser.user.id,
        email,
        role: role || "earner"
      })

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400 }
      )
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 })

  } catch (err: unknown) {
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err)
      }),
      { status: 500 }
    )
  }
})
