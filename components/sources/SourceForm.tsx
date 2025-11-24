"use client"
import { useEffect, useState } from "react"
import { IncomeSource } from "@/lib/types"


export default function SourceForm({ data, onChange }: {
    data: Partial<IncomeSource>
    onChange: (v: Partial<IncomeSource>) => void
}) {
    function update<K extends keyof IncomeSource>(field: K, value: IncomeSource[K]) {
        onChange({ ...data, [field]: value })
    }


    const [rawAmount, setRawAmount] = useState("")
    const [rawMonthly, setRawMonthly] = useState("")


    useEffect(() => {
        setRawAmount(data.expected_amount != null ? String(data.expected_amount) : "")
        setRawMonthly(data.expected_monthly != null ? String(data.expected_monthly) : "")
    }, [data.id])


    return (
        <div className="space-y-5">
            <div>
                <label className="block text-sm font-medium text-gray-700">Source Name *</label>
                <input type="text" value={data.source_name ?? ""} onChange={(e) => update("source_name", e.target.value)} className="mt-1 block w-full rounded border-gray-300" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700">Source Type</label>
                <select value={data.source_type ?? ""} onChange={(e) => update("source_type", e.target.value)} className="mt-1 block w-full rounded border-gray-300">
                    <option value="">Select...</option>
                    <option value="Commission">Commission</option>
                    <option value="Royalty">Royalty</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Rental">Rental</option>
                    <option value="Other">Other</option>
                </select>
            </div>
        </div>
    )
}