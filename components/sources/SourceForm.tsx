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

    // -------------------------------------------------------
    // Auto-calc expected_monthly when frequency or amount changes
    // -------------------------------------------------------
    useEffect(() => {
        if (!data.frequency || data.expected_amount == null) return

        let monthly = null

        switch (data.frequency) {
            case "Monthly":
                monthly = data.expected_amount
                break
            case "Weekly":
                monthly = data.expected_amount * 4.33
                break
            case "Quarterly":
                monthly = data.expected_amount / 3
                break
            case "Annual":
                monthly = data.expected_amount / 12
                break
        }

        update("expected_monthly", monthly ? Number(monthly.toFixed(2)) : null)
    }, [data.frequency, data.expected_amount])

    return (
        <div className="space-y-5">

            {/* Source Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Source Name *
                </label>
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
                <label className="block text-sm font-medium text-gray-700">
                    Source Type
                </label>
                <select
                    value={data.source_type ?? ""}
                    onChange={(e) => update("source_type", e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300"
                >
                    <option value="">Select...</option>
                    <option value="Royalty">Royalty</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Rental">Rental</option>
                    <option value="Dividends">Dividends</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            {/* Frequency */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Frequency
                </label>
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
                </select>
            </div>

            {/* Expected Amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Expected Amount
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={data.expected_amount ?? ""}
                    onChange={(e) =>
                        update("expected_amount", e.target.value ? Number(e.target.value) : null)
                    }
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="Enter amount"
                />
            </div>

            {/* Expected Monthly */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Expected Monthly
                </label>
                <input
                    type="number"
                    step="0.01"
                    value={data.expected_monthly ?? ""}
                    onChange={(e) =>
                        update("expected_monthly", e.target.value ? Number(e.target.value) : null)
                    }
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="Auto or override"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Notes
                </label>
                <textarea
                    value={data.notes ?? ""}
                    onChange={(e) => update("notes", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                    rows={3}
                    placeholder="Optional notes"
                />
            </div>
        </div>
    )
}
