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

    //---------------------------------------------------------------------
    // Safe update helper
    //---------------------------------------------------------------------
    function update<K extends keyof IncomeSource>(
        key: K,
        value: IncomeSource[K] | null
    ) {
        onChange({
            ...data,
            [key]: value
        });
    }

    //---------------------------------------------------------------------
    // Raw inputs (prevent formatting during typing)
    //---------------------------------------------------------------------
    const [rawAmount, setRawAmount] = useState("");
    const [rawMonthly, setRawMonthly] = useState("");

    useEffect(() => {
        setRawAmount(
            data.expected_amount != null ? String(data.expected_amount) : ""
        );

        setRawMonthly(
            data.expected_monthly != null ? String(data.expected_monthly) : ""
        );
    }, [data]);

    //---------------------------------------------------------------------
    // Currency parsing + formatting
    //---------------------------------------------------------------------
    function parseCurrency(v: string): number | null {
        const cleaned = v.replace(/[^0-9.-]/g, "");
        if (!cleaned) return null;

        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    }

    function formatCurrency(val: number | null): string {
        if (val == null) return "";
        return val.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    }

    //---------------------------------------------------------------------
    // Monthly calculator (7 frequencies)
    //---------------------------------------------------------------------
    function calculateMonthly(amount: number | null, frequency: string | null) {
        if (!amount || !frequency) return amount;

        switch (frequency) {
            case "Weekly":
                return parseFloat((amount * 4.345).toFixed(2));
            case "Bi-Weekly":
                return parseFloat((amount * 2.172).toFixed(2));
            case "Monthly":
                return amount;
            case "Quarterly":
                return parseFloat((amount / 3).toFixed(2));
            case "Annual":
                return parseFloat((amount / 12).toFixed(2));
            case "One-Time":
                return amount;
            case "Varies":
                return amount;
            default:
                return amount;
        }
    }

    //---------------------------------------------------------------------
    // Expected Amount Updates
    //---------------------------------------------------------------------
    function handleAmountChange(v: string) {
        setRawAmount(v);

        const value = parseCurrency(v);
        update("expected_amount", value);

        if (value != null && data.frequency) {
            const monthly = calculateMonthly(value, data.frequency);
            update("expected_monthly", monthly);
            setRawMonthly(monthly != null ? String(monthly) : "");
        }
    }

    function handleAmountBlur() {
        setRawAmount(formatCurrency(data.expected_amount ?? null));
    }

    //---------------------------------------------------------------------
    // Expected Monthly (editable but rare)
    //---------------------------------------------------------------------
    function handleMonthlyChange(v: string) {
        setRawMonthly(v);
        const value = parseCurrency(v);
        update("expected_monthly", value);
    }

    function handleMonthlyBlur() {
        setRawMonthly(formatCurrency(data.expected_monthly ?? null));
    }

    //---------------------------------------------------------------------
    // Frequency Selection
    //---------------------------------------------------------------------
    function handleFrequencyChange(freq: string | null) {
        const safeFreq = freq ?? "Monthly";
        update("frequency", safeFreq);

        if (data.expected_amount != null) {
            const monthly = calculateMonthly(data.expected_amount, safeFreq);
            update("expected_monthly", monthly);
            setRawMonthly(monthly != null ? String(monthly) : "");
        }
    }

    //---------------------------------------------------------------------
    // FORM UI
    //---------------------------------------------------------------------
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
                />
            </div>

            {/* Source Type */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Source Type
                </label>
                <select
                    value={data.source_type ?? ""}
                    onChange={(e) => update("source_type", e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                >
                    <option value="">Select...</option>
                    <option value="Commission">Commission</option>
                    <option value="Royalty">Royalty</option>
                    <option value="Affiliate">Affiliate</option>
                    <option value="Rental">Rental</option>
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
                    onChange={(e) => handleFrequencyChange(e.target.value || null)}
                    className="mt-1 block w-full rounded border-gray-300"
                >
                    <option value="">Select...</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Weekly">Weekly</option>
                    <option value="Bi-Weekly">Bi-Weekly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="One-Time">One-Time</option>
                    <option value="Varies">Varies</option>
                </select>
            </div>

            {/* Expected Amount */}
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Expected Amount *
                </label>
                <input
                    type="text"
                    value={rawAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onBlur={handleAmountBlur}
                    className="mt-1 block w-full rounded border-gray-300"
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
                    className="mt-1 block w-full rounded border-gray-300"
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
                    className="mt-1 block w-full rounded border-gray-300"
                    rows={3}
                />
            </div>

        </div>
    );
}
