"use client"

import { useEffect, useState } from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    data: Partial<IncomeSource>
    onChange: (values: Partial<IncomeSource>) => void
}

export default function SourceForm({ data, onChange }: Props) {

    function update<K extends keyof IncomeSource>(key: K, value: IncomeSource[K]) {
        onChange({ ...data, [key]: value })
    }

    const [amount, setAmount] = useState("")
    const [monthly, setMonthly] = useState("")

    useEffect(() => {
        setAmount(data.expected_amount?.toString() ?? "")
        setMonthly(data.expected_monthly?.toString() ?? "")
    }, [data.expected_amount, data.expected_monthly])

    function moneyFormat(n: number | null) {
        if (n == null) return ""
        return n.toLocaleString("en-US", { style: "currency", currency: "USD" })
    }

    function clean(v: string) {
        return v.replace(/[^0-9.]/g, "")
    }

    function calcMonthly(v: number, freq: string | null) {
        if (!freq) return v
        switch (freq) {
            case "Weekly": return v * 4.33
            case "Quarterly": return v / 3
            case "Annual": return v / 12
            default: return v
        }
    }

    function handleAmount(v: string) {
        setAmount(v)
        const num = Number(clean(v))
        if (!isNaN(num)) {
            update("expected_amount", num)
            if (data.frequency) {
                const m = calcMonthly(num, data.frequency)
                update("expected_monthly", m)
                setMonthly(m.toString())
            }
        }
    }

    function handleMonthly(v: string) {
        setMonthly(v)
        const num = Number(clean(v))
        if (!isNaN(num)) update("expected_monthly", num)
    }

    return (
        <div className="space-y-5">

            <div>
                <label>Source Name *</label>
                <input
                    type="text"
                    value={data.source_name ?? ""}
                    onChange={e => update("source_name", e.target.value)}
                    className="mt-1 w-full border rounded p-2"
                />
            </div>

            <div>
                <label>Source Type</label>
                <input
                    value={data.source_type ?? ""}
                    onChange={e => update("source_type", e.target.value)}
                    className="mt-1 w-full border rounded p-2"
                />
            </div>

            <div>
                <label>Frequency</label>
                <select
                    value={data.frequency ?? ""}
                    onChange={e => update("frequency", e.target.value || null)}
                    className="mt-1 w-full border rounded p-2"
                >
                    <option value="">Select...</option>
                    <option>Monthly</option>
                    <option>Weekly</option>
                    <option>Quarterly</option>
                    <option>Annual</option>
                    <option>Other</option>
                </select>
            </div>

            <div>
                <label>Expected Amount</label>
                <input
                    value={amount}
                    onChange={e => handleAmount(e.target.value)}
                    onBlur={() => setAmount(moneyFormat(data.expected_amount ?? null))}
                    className="mt-1 w-full border rounded p-2"
                    placeholder="$0.00"
                />
            </div>

            <div>
                <label>Expected Monthly</label>
                <input
                    value={monthly}
                    onChange={e => handleMonthly(e.target.value)}
                    onBlur={() => setMonthly(moneyFormat(data.expected_monthly ?? null))}
                    className="mt-1 w-full border rounded p-2"
                    placeholder="$0.00"
                />
            </div>

            <div>
                <label>Notes</label>
                <textarea
                    value={data.notes ?? ""}
                    onChange={e => update("notes", e.target.value)}
                    className="mt-1 w-full border rounded p-2"
                />
            </div>

        </div>
    )
}
