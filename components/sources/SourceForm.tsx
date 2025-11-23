"use client"

import React, { useEffect, useState } from "react"
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

    // RAW INPUT BUFFERS (prevents stuck typing)
    const [rawAmount, setRawAmount] = useState("")
    const [rawMonthly, setRawMonthly] = useState("")

    // Load initial values only on mount or when editing an existing source
    useEffect(() => {
        setRawAmount(
            data.expected_amount != null
                ? String(data.expected_amount)
                : ""
        )

        setRawMonthly(
            data.expected_monthly != null
                ? String(data.expected_monthly)
                : ""
        )
    }, [data.id]) // ONLY fires when switching between items

    // Convert "$1,234.50" → 1234.50 numeric
    function parseCurrency(v: string): number | null {
        const cleaned = v.replace(/[^0-9.-]/g, "")
        if (!cleaned) return null
        const num = Number(cleaned)
        return isNaN(num) ? null : num
    }

    // Format number to "$1,234.00"
    function formatCurrency(val: number | null): string {
        if (val == null) return ""
        return val.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })
    }

    // MONTHLY AUTO-CALC
    function calculateMonthly(amount: number | null, frequency: string | null): number | null {
        if (!amount || !frequency) return amount

        switch (frequency) {
            case "Weekly": return parseFloat((amount * 4.33).toFixed(2))
            case "Monthly": return amount
            case "Quarterly": return parseFloat((amount / 3).toFixed(2))
            case "Annual": return parseFloat((amount / 12).toFixed(2))
            default: return amount
        }
    }

    // AMOUNT HANDLER
    function handleAmountChange(v: string) {
        setRawAmount(v)

        const value = parseCurrency(v)
        update("expected_amount", value)

        if (value != null && data.frequency) {
            const monthly = calculateMonthly(value, data.frequency)
            update("expected_monthly", monthly)
            setRawMonthly(monthly != null ? String(monthly) : "")
        }
    }

    function handleAmountBlur() {
        setRawAmount(formatCurrency(data.expected_amount ?? null))
    }

    // MONTHLY HANDLER
    function handleMonthlyChange(v: string) {
        setRawMonthly(v)
        const value = parseCurrency(v)
        update("expected_monthly", value)
    }

    function handleMonthlyBlur() {
        setRawMonthly(formatCurrency(data.expected_monthly ?? null))
    }

    // FREQUENCY CHANGE → RECALCULATE MONTHLY
    function handleFrequencyChange(freq: string | null) {
        update("frequency", freq)

        if (data.expected_amount != null) {
            const monthly = calculateMonthly(data.expected_amount, freq)
            update("expected_monthly", monthly)
            setRawMonthly(monthly != null ? String(monthly) : "")
        }
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
                    value={data.source_name ?? ""}
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
                    onChange={(e) => update("source_type", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="Royalty, Affiliate, Rental, etc."
                />
            </div>

            {/* Frequency */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Frequency
                </label>
                <select
                    value={data.frequency ?? ""}
                    onChange={(e) => handleFrequencyChange(e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
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
                <label className="block text-sm font-medium text-gray-700">
                    Expected Amount
                </label>
                <input
                    type="text"
                    value={rawAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onBlur={handleAmountBlur}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="$0.00"
                />
            </div>

            {/* Expected Monthly */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Expected Monthly
                </label>
                <input
                    type="text"
                    value={rawMonthly}
                    onChange={(e) => handleMonthlyChange(e.target.value)}
                    onBlur={handleMonthlyBlur}
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    placeholder="$0.00"
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
                    className="mt-1 block w-full rounded border-gray-300 focus:ring-[#C6A664] focus:border-[#C6A664]"
                    rows={3}
                    placeholder="Optional notes about this source..."
                />
            </div>

        </div>
    )
}
