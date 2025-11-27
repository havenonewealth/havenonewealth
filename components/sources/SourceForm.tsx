"use client";

import { useEffect, useState, useRef } from "react";
import type { IncomeSource } from "@/lib/types";

export default function SourceForm({
    data,
    onChange
}: {
    data: Partial<IncomeSource>;
    onChange: (v: Partial<IncomeSource>) => void;
}) {
    // ---------------------------------------------
    // Local raw fields (debounced updates)
    // ---------------------------------------------
    const [rawAmount, setRawAmount] = useState("");
    const [rawMonthly, setRawMonthly] = useState("");

    const [errors, setErrors] = useState<{ amount?: string; name?: string }>({});

    const debounceTimer = useRef<any>(null);

    // ---------------------------------------------
    // Sync local raw values when editing changes
    // ---------------------------------------------
    useEffect(() => {
        setRawAmount(data.expected_amount != null ? String(data.expected_amount) : "");
        setRawMonthly(data.expected_monthly != null ? String(data.expected_monthly) : "");
    }, [data]);

    // ---------------------------------------------
    // Currency utilities
    // ---------------------------------------------
    const parseCurrency = (v: string): number | null => {
        const cleaned = v.replace(/[^0-9.-]/g, "");
        if (!cleaned) return null;
        const num = Number(cleaned);
        return isNaN(num) ? null : num;
    };

    const formatCurrency = (val: number | null): string => {
        if (val == null) return "";
        return val.toLocaleString("en-US", {
            style: "currency",
            currency: "USD"
        });
    };

    // ---------------------------------------------
    // Frequency to Monthly calculation
    // ---------------------------------------------
    const calculateMonthly = (amount: number | null, frequency: string | null) => {
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
    };

    // ---------------------------------------------
    // Debounced parent state update
    // ---------------------------------------------
    const debouncedUpdate = (changes: Partial<IncomeSource>) => {
        if (debounceTimer.current) clearTimeout(debounceTimer.current);

        debounceTimer.current = setTimeout(() => {
            onChange({ ...data, ...changes });
        }, 500); // feels natural
    };

    // ---------------------------------------------
    // Field handlers
    // ---------------------------------------------
    const handleNameChange = (v: string) => {
        if (!v.trim()) {
            setErrors((e) => ({ ...e, name: "Source name is required." }));
        } else {
            setErrors((e) => ({ ...e, name: undefined }));
        }
        debouncedUpdate({ source_name: v });
    };

    const handleAmountChange = (v: string) => {
        setRawAmount(v);
        const num = parseCurrency(v);

        if (num == null || num <= 0) {
            setErrors((e) => ({ ...e, amount: "Expected amount must be greater than zero." }));
        } else {
            setErrors((e) => ({ ...e, amount: undefined }));
        }

        const monthly = calculateMonthly(num, data.frequency ?? "Monthly");

        setRawMonthly(monthly != null ? String(monthly) : "");
        debouncedUpdate({
            expected_amount: num ?? undefined,
            expected_monthly: monthly ?? undefined
        });
    };

    const handleMonthlyChange = (v: string) => {
        setRawMonthly(v);
        const num = parseCurrency(v);
        debouncedUpdate({ expected_monthly: num ?? undefined });
    };

    const handleFrequencyChange = (freq: string) => {
        const num = data.expected_amount ?? null;
        const monthly = calculateMonthly(num, freq);

        setRawMonthly(monthly != null ? String(monthly) : "");
        debouncedUpdate({
            frequency: freq,
            expected_monthly: monthly ?? undefined
        });
    };

    // ---------------------------------------------
    // UI
    // ---------------------------------------------
    return (
        <div className="space-y-6">

            {/* Source Name */}
            <div>
                <label className="block text-sm font-medium">Source Name *</label>
                <input
                    type="text"
                    defaultValue={data.source_name ?? ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-1 block w-full rounded border-gray-300"
                />
                {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                )}
            </div>

            {/* Source Type */}
            <div>
                <label className="block text-sm font-medium">Source Type</label>
                <select
                    defaultValue={data.source_type ?? ""}
                    onChange={(e) => debouncedUpdate({ source_type: e.target.value })}
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
                <label className="block text-sm font-medium">Frequency</label>
                <select
                    defaultValue={data.frequency ?? ""}
                    onChange={(e) => handleFrequencyChange(e.target.value)}
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
                <label className="block text-sm font-medium">Expected Amount</label>
                <input
                    type="text"
                    value={rawAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onBlur={() => setRawAmount(formatCurrency(data.expected_amount ?? null))}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="$0.00"
                />
                {errors.amount && (
                    <p className="text-red-600 text-xs mt-1">{errors.amount}</p>
                )}
            </div>

            {/* Expected Monthly */}
            <div>
                <label className="block text-sm font-medium">Expected Monthly</label>
                <input
                    type="text"
                    value={rawMonthly}
                    onChange={(e) => handleMonthlyChange(e.target.value)}
                    onBlur={() => setRawMonthly(formatCurrency(data.expected_monthly ?? null))}
                    className="mt-1 block w-full rounded border-gray-300"
                    placeholder="$0.00"
                />
            </div>

            {/* Live preview panel */}
            <div className="mt-3 p-3 bg-gray-50 rounded border text-sm text-gray-700">
                <div>
                    <strong>Projected Monthly:</strong>{" "}
                    {data.expected_monthly ? formatCurrency(data.expected_monthly) : "$0.00"}
                </div>
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium">Notes</label>
                <textarea
                    defaultValue={data.notes ?? ""}
                    onChange={(e) => debouncedUpdate({ notes: e.target.value })}
                    className="mt-1 block w-full rounded border-gray-300"
                    rows={3}
                />
            </div>
        </div>
    );
}
