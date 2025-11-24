import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json();

        // Payload with allowed fields
        const safePayload = {
            source_name: payload.source_name,
            source_type: payload.source_type ?? null,
            frequency: payload.frequency ?? null,
            expected_amount: payload.expected_amount ?? null,
            expected_monthly: payload.expected_monthly ?? null,
            notes: payload.notes ?? null,
            user_id: payload.user_id      // only used for CREATE
        };

        let result;

        if (id) {
            // UPDATE — remove user_id so it cannot be updated
            const { user_id, ...updateFields } = safePayload;

            result = await supabase
                .from("income_sources")
                .update(updateFields)
                .eq("id", id)
                .select("*");
        } else {
            // CREATE — allow full payload
            result = await supabase
                .from("income_sources")
                .insert(safePayload)
                .select("*");
        }

        if (result.error) {
            console.error("API save error:", result.error);
            return NextResponse.json(
                { success: false, error: result.error.message },
                { status: 400 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (e: any) {
        console.error("Unhandled save API error:", e);
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 500 }
        );
    }
}
