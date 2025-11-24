import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()

        if (!payload || !payload.user_id) {
            return NextResponse.json(
                { success: false, error: "Invalid payload." },
                { status: 400 }
            )
        }

        // Strip fields that should NEVER be updated
        const {
            id: _ignoreId,
            user_id: _ignoreUserId,
            ...updateFields
        } = payload

        let result

        if (id) {
            // UPDATE
            result = await supabase
                .from("income_sources")
                .update(updateFields)
                .eq("id", id)
                .select("*")
                .maybeSingle()
        } else {
            // CREATE
            result = await supabase
                .from("income_sources")
                .insert(payload)
                .select("*")
                .maybeSingle()
        }

        if (result.error) {
            console.error("SAVE API ERROR:", result.error)
            return NextResponse.json(
                { success: false, error: result.error.message },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: true, data: result.data },
            { status: 200 }
        )
    } catch (e: any) {
        console.error("Unhandled API error:", e)
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 500 }
        )
    }
}
