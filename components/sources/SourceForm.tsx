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

    // ---------------------------------------------------------
    // RAW INPUT BUFFERS (prevents currency formatting from freezing input)
    // ---------------------------------------------------------
    const [rawAmount, setRawAmount] = useState("")
    const [rawMonthly, setRawMonthly] = useState("")

    // Load existing values when editing
    useEffect(() => {
        if (data.expected_amount != null) {
            setRawAmount(String(data.expected_amount))
        } else {
            setRawAmount("")
        }

        if (data.expected_monthly != null) {
            setRawMonthly(String(data.expected_monthly))
        } else {
            setRawMonthly("")
        }
    }, [data.expected_amount, data.expected_monthly])

    // ---------------------------------------------------------
    // EXPECTED AMOUNT (currency-enabled typing)
    // ---------------------------------------------------------
    function handleAmountChange(v: string) {
        setRawAmount(v)

        const cleaned = v.replace(/[^0-9.-]/g, "")
        const num = cleaned === "" ? null : Number(cleaned)

        if (!isNaN(num as any)) {
            update("expected_amount", num as any)

            // Auto-calc expected_monthly
            if (data.frequency) {
                const monthly = calculateMonthly(num ?? 0, data.frequency)
                update("expected_monthly", monthly)
                setRawMonthly(String(monthly))
            }
        }
    }

    function handleAmountBlur() {
        if (data.expected_amount != null) {
            setRawAmount(
                data.expected_amount.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                })
            )
        }
    }

    // ---------------------------------------------------------
    // EXPECTED MONTHLY (currency-enabled typing)
    // ---------------------------------------------------------
    function handleMonthlyChange(v: string) {
        setRawMonthly(v)

        const cleaned = v.replace(/[^0-9.-]/g, "")
        const num = cleaned === "" ? null : Number(cleaned)

        if (!isNaN(num as any)) {
            update("expected_monthly", num as any)
        }
    }

    function handleMonthlyBlur() {
        if (data.expected_monthly != null) {
            setRawMonthly(
                data.expected_monthly.toLocaleString("en-US", {
                    style: "currency",
                    currency: "USD"
                })
            )
        }
    }

    // ---------------------------------------------------------
    // Monthly Auto-calculation Logic
    // ---------------------------------------------------------
    function calculateMonthly(amount: number, frequency: string | null): number | null {
        if (!frequency || !amount) return amount

        switch (frequency) {
            case "Weekly":
                return parseFloat((amount * 4.33).toFixed(2))
            case "Monthly":
                return amount
            case "Quarterly":
                return parseFloat((amount / 3).toFixed(2))
            case "Annual":
                return parseFloat((amount / 12).toFixed(2))
            default:
                return amount
        }
    }

    function handleFrequencyChange(freq: string | null) {
        update("frequency", freq)

        if (freq && data.expected_amount != null) {
            const monthly = calculateMonthly(data.expected_amount, freq)
            update("expected_monthly", monthly)
            setRawMonthly(String(monthly))
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
