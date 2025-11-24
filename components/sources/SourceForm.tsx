"use client"

import { IncomeSource } from "@/lib/types"
import { useState, useEffect } from "react"

export default function SourceForm({
    data,
    onChange
}: {
    data: Partial<IncomeSource>
    onChange: (v: Partial<IncomeSource>) => void
}) {
    function update<K extends keyof IncomeSource>(field: K, value: IncomeSource[K]) {
        onChange({
            ...data,
            [field]: value
        })
    }

    const [rawAmount, setRawAmount] = useState("")
    const [rawMonthly, setRawMonthly] = useState("")

    useEffect(() => {
        setRawAmount(data.expected_amount != null ? String(data.expected_amount) : "")
        setRawMonthly(data.expected_monthly != null ? String(data.expected_monthly) : "")
    }, [data.id])

    function parseCurrency(v: string): number | null {
        const cleaned = v.replace(/[^0-9.-]/g, "")
        if (!cleaned) return null
        const n = Number(cleaned)
        return isNaN(n) ? null : n
    }

    function calculateMonthly(amount: number | null, frequency: string | null) {
        if (!amount || !frequency) return amount
        switch (frequency) {
            case "Weekly": return Number((amount * 4.33).toFixed(2))
            case "Monthly": return amount
            case "Quarterly": return Number((amount / 3).toFixed(2))
            case "Annual": return Number((amount / 12).toFixed(2))
            default: return amount
        }
    }

    return (
        <div className="space-y-5">

            <div>
                <label className="block text-sm font-medium">Source Name *</label>
                <input
                    value={data.source_name ?? ""}
                    onChange={(e) => update("source_name", e.target.value)}
                    className="mt-1 w-full rounded border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Source Type</label>
                <select
                    value={data.source_type ?? ""}
                    onChange={(e) => update("source_type", e.target.value)}
                    className="mt-1 w-full rounded border"
                >
                    <option value="">Select…</option>
                    <option value="Commission">Commission</option>
                    <option value="Royalty">Royalty</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Rental">Rental</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Frequency</label>
                <select
                    value={data.frequency ?? ""}
                    onChange={(e) => update("frequency", e.target.value || null)}
                    className="mt-1 w-full rounded border"
                >
                    <option value="">Select…</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Expected Amount</label>
                <input
                    value={rawAmount}
                    onChange={(e) => {
                        setRawAmount(e.target.value)
                        const num = parseCurrency(e.target.value)
                        update("expected_amount", num)
                        if (num != null && data.frequency) {
                            update("expected_monthly", calculateMonthly(num, data.frequency))
                            setRawMonthly(String(calculateMonthly(num, data.frequency)))
                        }
                    }}
                    className="mt-1 w-full rounded border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Expected Monthly</label>
                <input
                    value={rawMonthly}
                    onChange={(e) => {
                        setRawMonthly(e.target.value)
                        update("expected_monthly", parseCurrency(e.target.value))
                    }}
                    className="mt-1 w-full rounded border"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                    value={data.notes ?? ""}
                    onChange={(e) => update("notes", e.target.value)}
                    className="mt-1 w-full rounded border"
                    rows={3}
                />
            </div>

        </div>
    )
}
