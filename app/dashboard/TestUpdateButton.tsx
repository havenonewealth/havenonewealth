"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function TestUpdateButton() {
    const [result, setResult] = useState<string>("")

    async function runTest() {
        setResult("Running...")

        // 1. Pull logged-in user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            setResult("Not logged in")
            return
        }

        // 2. Fetch a REAL existing source
        const { data: sources, error: fetchErr } = await supabase
            .from("income_sources")
            .select("id, source_name")
            .eq("user_id", user.id)
            .limit(1)

        if (fetchErr || !sources || sources.length === 0) {
            setResult("No existing source found to update.")
            return
        }

        const source = sources[0]

        // 3. Build update payload
        const body = {
            id: source.id, // MUST be a real UUID
            payload: {
                source_name: "UPDATED_FROM_TEST_BUTTON",
                source_type: "Commission",
                frequency: "Monthly",
                expected_amount: 777,
                expected_monthly: 777,
                notes: "Updated via test button",
                user_id: user.id
            }
        }

        // 4. Call the API
        const res = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        })

        const json = await res.json()

        if (!json.success) {
            setResult(`Failed: ${json.error}`)
            console.error("Test update error:", json.error)
            return
        }

        setResult(`SUCCESS: Updated ${source.id}`)
    }

    return (
        <div className="mt-2">
            <button
                onClick={runTest}
                className="px-4 py-2 bg-blue-600 text-white rounded"
            >
                Run TEST UPDATE
            </button>

            <div className="mt-2 text-sm text-red-600">{result}</div>
        </div>
    )
}
