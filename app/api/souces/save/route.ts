import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()

        // Build safe payload for BOTH create & update
        const editableFields = {
            source_name: payload.source_name?.trim() ?? null,
            source_type: payload.source_type ?? null,
            frequency: payload.frequency ?? null,
            expected_amount: payload.expected_amount ?? null,
            expected_monthly: payload.expected_monthly ?? null,
            notes: payload.notes ?? null
        }

        let result

        if (id) {
            // -------------------------------
            // UPDATE — NEVER update user_id
            // -------------------------------
            result = await supabase
                .from("income_sources")
                .update(editableFields)
                .eq("id", id)
                .select()
                .single()
        } else {
            // -------------------------------
            // CREATE — MUST include user_id
            // -------------------------------
            result = await supabase
                .from("income_sources")
                .insert({
                    ...editableFields,
                    user_id: payload.user_id
                })
                .select()
                .single()
        }

        if (result.error) {
            console.error("API save error:", result.error)
            return NextResponse.json({
                success: false,
                error: result.error.message
            })
        }

        return NextResponse.json({
            success: true,
            data: result.data
        })

    } catch (e: any) {
        console.error("Unhandled save API error:", e)
        return NextResponse.json({
            success: false,
            error: e.message
        })
    }
}
