// app/api/sources/save/route.ts
import { NextResponse } from "next/server"
import { saveSource } from "@/lib/supabase/sources"

export async function POST(req: Request) {
    try {
        const { id, payload } = await req.json()

        console.log("API /save REQUEST:", { id, payload })

        if (!payload || !payload.user_id) {
            return NextResponse.json(
                { success: false, error: "Missing payload or user_id" },
                { status: 400 }
            )
        }

        // Use the ACTUAL working saveSource function
        const ok = await saveSource(id, payload)

        if (!ok) {
            return NextResponse.json(
                { success: false, error: "Save failed (check logs)" },
                { status: 400 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (e: any) {
        console.error("API /save ERROR:", e)
        return NextResponse.json(
            { success: false, error: e.message || "Unhandled error" },
            { status: 500 }
        )
    }
}
