import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()

        if (!payload) {
            return NextResponse.json(
                { success: false, error: "Missing payload" },
                { status: 400 }
            )
        }

        // Force correct numeric types
        const clean = {
            ...payload,
            expected_amount: payload.expected_amount != null
                ? Number(payload.expected_amount)
                : null,
            expected_monthly: payload.expected_monthly != null
                ? Number(payload.expected_monthly)
                : null
        }

        let result

        if (id) {
            // UPDATE
            result = await supabase
                .from("income_sources")
                .update(clean)
                .eq("id", id)
                .select("*")
                .maybeSingle()

            // Extra safeguard: update affected zero rows
            if (result.data === null) {
                return NextResponse.json(
                    { success: false, error: "Update failed — record not found." },
                    { status: 404 }
                )
            }
        } else {
            // CREATE
            result = await supabase
                .from("income_sources")
                .insert(clean)
                .select("*")
                .maybeSingle()
        }

        if (result.error) {
            return NextResponse.json(
                { success: false, error: result.error.message },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            data: result.data
        })
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 500 }
        )
    }
}
