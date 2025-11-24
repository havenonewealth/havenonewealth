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

    // Allow null and undefined when updating
    function update<K extends keyof IncomeSource>(
        key: K,
        value: IncomeSource[K] | null | undefined
    ) {
        onChange({
            ...data,
            [key]: value
        });
    }

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
            case "Varies":
                return amount;
            default:
                return amount;
        }
    }

    function handleAmountChange(v: string) {
        setRawAmount(v);

        const value = parseCurrency(v);
        update("expected_amount", value ?? undefined);

        if (value != null && data.frequency) {
            const monthly = calculateMonthly(value, data.frequency);
            update("expected_monthly", monthly ?? undefined);
            setRawMonthly(monthly != null ? String(monthly) : "");
        }
    }

    function handleAmountBlur() {
        setRawAmount(formatCurrency(data.expected_amount ?? null));
    }

    function handleMonthlyChange(v: string) {
        setRawMonthly(v);
        const value = parseCurrency(v);
        update("expected_monthly", value ?? undefined);
    }

    function handleMonthlyBlur() {
        setRawMonthly(formatCurrency(data.expected_monthly ?? null));
    }

    function handleFrequencyChange(freq: string | null) {
        update("frequency", freq);

        if (data.expected_amount != null) {
            const monthly = calculateMonthly(data.expected_amount, freq);
            update("expected_monthly", monthly ?? undefined);
            setRawMonthly(monthly != null ? String(monthly) : "");
        }
    }

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
                    className="mt-1 block w-full rounded border-gray-300"
                />
            </div>

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

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Expected Amount
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
