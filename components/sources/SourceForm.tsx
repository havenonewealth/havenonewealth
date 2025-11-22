"use client"

import React, { useEffect } from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    data: Partial<IncomeSource>
    onChange: (values: Partial<IncomeSource>) => void
}

export default function SourceForm({ data, onChange }: Props) {
    function update<K extends keyof IncomeSource>(key: K, value: IncomeSource[K]) {
        onChange({
            ...data,
            [key]: value
        })
    }

    // Convert formatted currency → number
    function parseCurrency(input: string): number | null {
        if (!input) return null
        const cleaned = input.replace(/[^0-9.-]/g, "")
        const num = Number(cleaned)
        return isNaN(num) ? null : num
    }

    // Format number → currency
    function formatCurrency(num: number | null | undefined): string {
        if (num == null) return ""
        return num.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })
    }

    // Auto-calc expected_monthly
    useEffect(() => {
        if (!data.frequency || !data.expected_amount) return

        let monthly = null

        switch (data.frequency) {
            case "Monthly":
                monthly = data.expected_amount
                break
            case "Weekly":
                monthly = Number((data.expected_amount * 4).toFixed(2))
                break
            case "Quarterly":
                monthly = Number((data.expected_amount / 3).toFixed(2))
                break
            case "Annual":
                monthly = Number((data.expected_amount / 12).toFixed(2))
                break
            default:
                monthly = null
        }

        update("expected_monthly", monthly as any)
    }, [data.frequency, data.expected_amount])

    return (
        <div className="space-y-5">

            {/* Source Name */}
            <div>
                <label className="text-sm font-medium">Source Name *</label>
                <input
                    type="text"
                    value={data.source_name ?? ""}
                    onChange={(e) => update("source_name", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                />
            </div>

            {/* Source Type */}
            <div>
                <label className="text-sm font-medium">Source Type</label>
                <input
                    type="text"
                    value={data.source_type ?? ""}
                    onChange={(e) => update("source_type", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="Royalty, Affiliate, Rental"
                />
            </div>

            {/* Frequency */}
            <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                    value={data.frequency ?? ""}
                    onChange={(e) => update("frequency", e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300"
                >
                    <option value="">Select...</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Expected Amount */}
            <div>
                <label className="text-sm font-medium">Expected Amount</label>
                <input
                    type="text"
                    value={formatCurrency(data.expected_amount)}
                    onChange={(e) => {
                        const parsed = parseCurrency(e.target.value)
                        update("expected_amount", parsed as any)
                    }}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="$0.00"
                />
            </div>

            {/* Expected Monthly */}
            <div>
                <label className="text-sm font-medium">Expected Monthly</label>
                <input
                    type="text"
                    value={formatCurrency(data.expected_monthly)}
                    onChange={(e) => {
                        const parsed = parseCurrency(e.target.value)
                        update("expected_monthly", parsed as any)
                    }}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="$0.00"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                    value={data.notes ?? ""}
                    onChange={(e) => update("notes", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                    rows={3}
                />
            </div>

        </div>
    )
}
