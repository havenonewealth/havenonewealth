"use client"

import React, { useEffect, useState } from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    data: Partial<IncomeSource>
    onChange: (updater: (prev: Partial<IncomeSource>) => Partial<IncomeSource>) => void
}

export default function SourceForm({ data, onChange }: Props) {

    function update<K extends keyof IncomeSource>(key: K, value: IncomeSource[K]) {
        onChange(prev => ({
            ...prev,
            [key]: value
        }))
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
        const num = Number(cleaned)
        return isNaN(num) ? null : num
    }

    function formatCurrency(val: number | null): string {
        if (val == null) return ""
        return val.toLocaleString("en-US", { style: "currency", currency: "USD" })
    }

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

    function handleMonthlyChange(v: string) {
        setRawMonthly(v)
        const value = parseCurrency(v)
        update("expected_monthly", value)
    }

    function handleMonthlyBlur() {
        setRawMonthly(formatCurrency(data.expected_monthly ?? null))
    }

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
            {/* unchanged UI */}
        </div>
    )
}
