// app/api/sources/save/route.ts
import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()

        // Never try to update id or user_id
        const {
            id: _ignoreId,
            user_id: _ignoreUserId,
            ...updateFields
        } = payload || {}

        let result

        if (id) {
            // UPDATE EXISTING ROW
            result = await supabase
                .from("income_sources")
                .update(updateFields)
                .eq("id", id)
                .select("*")
                .maybeSingle()
        } else {
            // INSERT NEW ROW
            result = await supabase
                .from("income_sources")
                .insert(payload)
                .select("*")
                .maybeSingle()
        }

        if (result.error) {
            console.error("API save error:", result.error)
            return NextResponse.json(
                {
                    success: false,
                    error: result.error.message
                },
                { status: 400 }
            )
        }

        return NextResponse.json(
            {
                success: true,
                data: result.data
            },
            { status: 200 }
        )
    } catch (e: any) {
        console.error("Unhandled save API error:", e)
        return NextResponse.json(
            {
                success: false,
                error: e.message
            },
            { status: 500 }
        )
    }
}
