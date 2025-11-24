"use client";

import { useEffect, useState } from "react";
import { IncomeSource } from "@/lib/types";

export default function SourceForm({
    data,
    onChange
}: {
    data: Partial<IncomeSource>;
    onChange: (v: Partial<IncomeSource>) => void;
}) {

    function update(field: keyof IncomeSource, value: any) {
        onChange((prev) => ({
            ...prev,
            [field]: value
        }));
    }

    const [rawAmount, setRawAmount] = useState("");
    const [rawMonthly, setRawMonthly] = useState("");

    useEffect(() => {
        setRawAmount(data.expected_amount != null ? String(data.expected_amount) : "");
        setRawMonthly(data.expected_monthly != null ? String(data.expected_monthly) : "");
    }, [data.id]);


    function parseCurrency(v: string): number | null {
        const cleaned = v.replace(/[^0-9.-]/g, "");
        if (!cleaned) return null;
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    }

    function calculateMonthly(amount: number | null, frequency: string | null) {
        if (!amount || !frequency) return amount;

        switch (frequency) {
            case "Weekly": return parseFloat((amount * 4.33).toFixed(2));
            case "Monthly": return amount;
            case "Quarterly": return parseFloat((amount / 3).toFixed(2));
            case "Annual": return parseFloat((amount / 12).toFixed(2));
            default: return amount;
        }
    }


    return (
        <div className="space-y-5">

            <div>
                <label className="block text-sm font-medium">Source Name *</label>
                <input
                    type="text"
                    value={data.source_name ?? ""}
                    onChange={(e) => update("source_name", e.target.value)}
                    className="mt-1 block w-full border rounded"
                />
            </div>

            <div>
                <label className="block text-sm font-medium">Source Type</label>
                <select
                    value={data.source_type ?? ""}
                    onChange={(e) => update("source_type", e.target.value)}
                    className="mt-1 block w-full border rounded"
                >
                    <option value="">Select...</option>
                    <option value="Commission">Commission</option>
                    <option value="Royalty">Royalty</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Rental">Rental</option>
                    <option value="Other">Other</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium">Frequency</label>
                <select
                    value={data.frequency ?? ""}
                    onChange={(e) => update("frequency", e.target.value)}
                    className="mt-1 block w-full border rounded"
                >
                    <option value="">Select...</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Other">Other</option>
                </select>
            </div>

        </div>
    );
}
