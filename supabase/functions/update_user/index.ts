import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type, apikey",
        "Access-Control-Allow-Methods": "POST, OPTIONS"
      }
    });
  }

  try {
    const { user_id, role, email } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: metaErr } = await supabase.auth.admin.updateUserById(
      user_id,
      { user_metadata: { role } }
    );

    if (metaErr) throw metaErr;

    const { error: dbErr } = await supabase
      .from("users")
      .update({ role, ...(email && { email }) })
      .eq("id", user_id);

    if (dbErr) throw dbErr;

    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (e: unknown) {
    return new Response(JSON.stringify({ error: `${e}` }), {
      status: 500,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }
});
