"use client";

import { useState, useEffect } from "react";
import { IncomeSource } from "@/lib/types";
import { useToast } from "@/components/ui/use-toast";
import SourceForm from "./SourceForm";

export default function SourceSlideOver({
    initial,
    userId,
    open,
    onClose,
    onSaved
}: {
    initial: IncomeSource | null;
    userId: string;
    open: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const { toast } = useToast();

    const [form, setForm] = useState<Partial<IncomeSource>>({
        id: undefined,
        user_id: userId,
        source_name: "",
        source_type: null,
        frequency: null,
        expected_amount: null,
        expected_monthly: null,
        notes: null
    });

    // Load initial object
    useEffect(() => {
        if (!open) return;

        if (initial) {
            setForm({
                id: initial.id,
                user_id: initial.user_id,
                source_name: initial.source_name ?? "",
                source_type: initial.source_type ?? null,
                frequency: initial.frequency ?? null,
                expected_amount: initial.expected_amount ?? null,
                expected_monthly: initial.expected_monthly ?? null,
                notes: initial.notes ?? null
            });
        } else {
            setForm({
                id: undefined,
                user_id: userId,
                source_name: "",
                source_type: null,
                frequency: null,
                expected_amount: null,
                expected_monthly: null,
                notes: null
            });
        }
    }, [initial, open, userId]);

    if (!open) return null;

    async function handleSave() {
        if (!form.source_name?.trim()) {
            toast({
                title: "Missing Name",
                description: "Source name is required."
            });
            return;
        }

        const response = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: form.id ?? null,
                payload: {
                    user_id: userId,
                    source_name: form.source_name,
                    source_type: form.source_type,
                    frequency: form.frequency,
                    expected_amount: form.expected_amount,
                    expected_monthly: form.expected_monthly,
                    notes: form.notes
                }
            })
        });

        let json;
        try {
            json = await response.json();
        } catch {
            toast({ title: "Error", description: "Unexpected server response." });
            return;
        }

        if (!json.success) {
            toast({
                title: "Error",
                description: json.error || "Could not save the source."
            });
            return;
        }

        toast({
            title: form.id ? "Updated" : "Created",
            description: "The source has been saved."
        });

        onSaved();
        onClose();
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0A1E2D]">
                        {form.id ? "Edit Source" : "New Source"}
                    </h2>

                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <SourceForm data={form} onChange={setForm} />

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-[#0A1E2D] text-white hover:bg-[#C6A664] transition"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    );
}
