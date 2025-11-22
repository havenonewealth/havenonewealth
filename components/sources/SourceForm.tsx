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

    function formatCurrency(num: number | null | undefined): string {
        if (num == null || isNaN(num as any)) return ""
        return num.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        })
    }

    const [rawAmount, setRawAmount] = useState("")
    const [rawMonthly, setRawMonthly] = useState("")

    useEffect(() => {
        setRawAmount(formatCurrency(data.expected_amount ?? null))
    }, [data.expected_amount])

    useEffect(() => {
        setRawMonthly(formatCurrency(data.expected_monthly ?? null))
    }, [data.expected_monthly])

    function calculateMonthly(amount: number, frequency: string | null): number | null {
        if (!frequency || !amount) return amount

        switch (frequency) {
            case "Weekly":
                return parseFloat((amount * 4.33).toFixed(2))
            case "Monthly":
                return parseFloat(amount.toFixed(2))
            case "Quarterly":
                return parseFloat((amount / 3).toFixed(2))
            case "Annual":
                return parseFloat((amount / 12).toFixed(2))
            default:
                return amount
        }
    }

    function handleAmountChange(v: string) {
        setRawAmount(v)

        const cleaned = v.replace(/[^0-9.]/g, "")
        if (cleaned === "") {
            update("expected_amount", null as any)
            return
        }

        const num = Number(cleaned)
        if (isNaN(num)) return

        update("expected_amount", num as any)
    }

    function handleMonthlyChange(v: string) {
        setRawMonthly(v)

        const cleaned = v.replace(/[^0-9.]/g, "")
        if (cleaned === "") {
            update("expected_monthly", null as any)
            return
        }

        const num = Number(cleaned)
        if (isNaN(num)) return

        update("expected_monthly", num as any)
    }

    function handleAmountBlur() {
        setRawAmount(formatCurrency(data.expected_amount ?? null))
    }

    function handleMonthlyBlur() {
        setRawMonthly(formatCurrency(data.expected_monthly ?? null))
    }

    function handleFrequencyChange(freq: string | null) {
        update("frequency", freq as any)

        if (freq && data.expected_amount != null && !isNaN(data.expected_amount as any)) {
            const monthly = calculateMonthly(data.expected_amount as number, freq)
            update("expected_monthly", monthly as any)
        }
    }

    useEffect(() => {
        if (!data.frequency || data.expected_amount == null || isNaN(data.expected_amount as any)) return

        const f = data.frequency
        if (!["Weekly", "Monthly", "Quarterly", "Annual"].includes(f)) return

        const monthly = calculateMonthly(data.expected_amount as number, f)
        if (monthly == null) return

        if (data.expected_monthly === monthly) return

        update("expected_monthly", monthly as any)
    }, [data.expected_amount, data.frequency])

    return (
        <div className="space-y-5">

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
