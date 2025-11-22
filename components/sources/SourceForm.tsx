"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    data: {
        source_name: string
        source_type: string | null
        frequency: string | null
        expected_amount: number | null
        expected_monthly: number | null
        notes: string | null
    }
    onChange: (values: any) => void
}

export default function SourceForm({ data, onChange }: Props) {

    function update(field: keyof typeof data, value: any) {
        onChange({
            ...data,
            [field]: value ?? null
        })
    }

    return (
        <div className="space-y-5">

            {/* Source Name */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Source Name *
                </label>
                <input
                    type="text"
                    value={data.source_name}
                    onChange={(e) => update("source_name", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="Example: Amazon KDP, Udemy, YouTube"
                />
            </div>

            {/* Source Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Source Type
                </label>
                <input
                    type="text"
                    value={data.source_type ?? ""}
                    onChange={(e) => update("source_type", e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="e.g. Royalty, Affiliate, Rental"
                />
            </div>

            {/* Frequency */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Frequency
                </label>
                <select
                    value={data.frequency ?? ""}
                    onChange={(e) => update("frequency", e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
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
                    value={data.expected_amount ?? ""}
                    onChange={(e) =>
                        update("expected_amount", e.target.value ? Number(e.target.value) : null)
                    }
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="Amount based on frequency"
                />
            </div>

            {/* Expected Monthly */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Expected Monthly Value
                </label>
                <input
                    type="number"
                    value={data.expected_monthly ?? ""}
                    onChange={(e) =>
                        update("expected_monthly", e.target.value ? Number(e.target.value) : null)
                    }
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="Auto-calculated or manual"
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Notes
                </label>
                <textarea
                    value={data.notes ?? ""}
                    onChange={(e) => update("notes", e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    rows={3}
                    placeholder="Optional notes..."
                />
            </div>

        </div>
    )
}
