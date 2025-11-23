import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()

        const safePayload = {
            source_name: payload.source_name,
            source_type: payload.source_type ?? null,
            frequency: payload.frequency ?? null,
            expected_amount: payload.expected_amount ?? null,
            expected_monthly: payload.expected_monthly ?? null,
            notes: payload.notes ?? null,
            user_id: payload.user_id
        }

        let result

        if (id) {
            result = await supabase
                .from("income_sources")
                .update(safePayload)
                .eq("id", id)
                .select()
        } else {
            result = await supabase
                .from("income_sources")
                .insert(safePayload)
                .select()
        }

        if (result.error) {
            console.error("API save error:", result.error)
            return NextResponse.json({ success: false, error: result.error.message })
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error("Unhandled save API error:", e)
        return NextResponse.json({ success: false, error: e.message })
    }
}
