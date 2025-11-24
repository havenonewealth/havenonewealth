"use client"

import { useState } from "react"

export default function TestInsertButton() {
    const [loading, setLoading] = useState(false)

    async function runTest() {
        setLoading(true)

        const payload = {
            id: null,
            payload: {
                user_id: "06e1e727-b913-404c-989e-762ec398023d",
                source_name: "TEST INSERT DIRECT API",
                source_type: "Commission",
                frequency: "Monthly",
                expected_amount: 1234.56,
                expected_monthly: 1234.56,
                notes: "Hardcoded test insert"
            }
        }

        const res = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        })

        const json = await res.json()
        console.log("TEST INSERT API RESULT =", json)

        setLoading(false)
    }

    return (
        <button
            onClick={runTest}
            disabled={loading}
            className="px-4 py-2 bg-green-700 text-white rounded mt-6"
        >
            {loading ? "Testing..." : "Run TEST INSERT"}
        </button>
    )
}
