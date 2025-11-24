import { supabase } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"


export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()


        const { id: _ignoreId, user_id: _ignoreUser, ...fields } = payload || {}


        let result


        if (id) {
            result = await supabase
                .from("income_sources")
                .update(fields)
                .eq("id", id)
                .select("*")
                .maybeSingle()
        } else {
            result = await supabase
                .from("income_sources")
                .insert(payload)
                .select("*")
                .maybeSingle()
        }


        if (result.error) {
            return NextResponse.json(
                { success: false, error: result.error.message },
                { status: 400 }
            )
        }


        return NextResponse.json({ success: true, data: result.data })
    } catch (e: any) {
        return NextResponse.json(
            { success: false, error: e.message },
            { status: 500 }
        )
    }
}