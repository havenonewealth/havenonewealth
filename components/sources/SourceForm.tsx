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

    // Auto-calc expected_monthly
    useEffect(() => {
        if (!data.frequency || !data.expected_amount) return

        const freq = data.frequency
        let monthly = null

        if (freq === "Monthly") monthly = data.expected_amount
        if (freq === "Weekly") monthly = Number((data.expected_amount * 4).toFixed(2))
        if (freq === "Quarterly") monthly = Number((data.expected_amount / 3).toFixed(2))
        if (freq === "Annual") monthly = Number((data.expected_amount / 12).toFixed(2))

        update("expected_monthly", monthly as any)
    }, [data.frequency, data.expected_amount])

    // Currency formatting
    function currency(n: number | null | undefined) {
        if (n == null) return ""
        return n.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })
    }

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
                    placeholder="Amazon KDP, Udemy, YouTube"
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
                    type="number"
                    value={data.expected_amount ?? ""}
                    onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null
                        update("expected_amount", val as any)
                    }}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="Amount based on frequency"
                />
                {data.expected_amount != null && (
                    <p className="text-xs text-gray-500 mt-1">
                        {currency(data.expected_amount)}
                    </p>
                )}
            </div>

            {/* Expected Monthly */}
            <div>
                <label className="text-sm font-medium">Expected Monthly Value</label>
                <input
                    type="number"
                    value={data.expected_monthly ?? ""}
                    onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : null
                        update("expected_monthly", val as any)
                    }}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="Auto-calculated or manual"
                />
                {data.expected_monthly != null && (
                    <p className="text-xs text-gray-500 mt-1">
                        {currency(data.expected_monthly)}
                    </p>
                )}
            </div>

            {/* Notes */}
            <div>
                <label className="text-sm font-medium">Notes</label>
                <textarea
                    value={data.notes ?? ""}
                    onChange={(e) => update("notes", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                    rows={3}
                    placeholder="Optional notes about this source..."
                />
            </div>
        </div>
    )
}
