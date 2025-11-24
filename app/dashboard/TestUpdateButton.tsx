"use client"

import { useState } from "react"

export default function TestUpdateButton() {
    const [status, setStatus] = useState<string | null>(null)

    async function handleUpdate() {
        setStatus("Updating...")

        // Use an existing row id from your income_sources table
        const existingId = "PUT_AN_EXISTING_SOURCE_ID_HERE"

        const payload = {
            source_name: "UPDATED VIA TEST BUTTON",
            source_type: "Commission",
            frequency: "Monthly",
            expected_amount: 1234.56,
            expected_monthly: 1234.56,
            notes: "Test update run from TestUpdateButton"
            // user_id will be ignored on update by the API
        }

        const res = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: existingId, payload })
        })

        let json: any = null
        try {
            json = await res.json()
        } catch {
            setStatus(`HTTP ${res.status} – no JSON body`)
            return
        }

        if (!json.success) {
            setStatus(`Failed: ${json.error || "unknown error"}`)
            console.error("TestUpdateButton error:", json)
            return
        }

        setStatus("Update succeeded")
        console.log("TestUpdateButton result:", json)
    }

    return (
        <div className="mt-4 flex items-center gap-3">
            <button
                onClick={handleUpdate}
                className="px-3 py-1 rounded bg-blue-600 text-white text-sm"
            >
                Run Test UPDATE
            </button>
            {status && <span className="text-xs text-gray-600">{status}</span>}
        </div>
    )
}
