import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    })
  }

  try {
    const { email, role } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    const { data: createdUser, error: createErr } =
      await supabase.auth.admin.createUser({
        email,
        user_metadata: { role }
      })

    if (createErr) throw createErr

    const userId = createdUser.user.id

    const { error: dbErr } = await supabase
      .from("users")
      .insert({ id: userId, email, role })

    if (dbErr) throw dbErr

    const { data: inviteData, error: inviteErr } =
      await supabase.auth.admin.inviteUserByEmail(email)

    if (inviteErr) throw inviteErr

    return new Response(
      JSON.stringify({ success: true, user: createdUser, invite: inviteData }),
      {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      }
    )
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: `${e}` }), {
      status: 400,
      headers: { "Access-Control-Allow-Origin": "*" }
    })
  }
})
