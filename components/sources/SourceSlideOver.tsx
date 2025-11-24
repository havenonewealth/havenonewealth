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

    const [form, setForm] = useState<Partial<IncomeSource>>({});

    // Build clean empty form template
    const emptyForm: Partial<IncomeSource> = {
        id: undefined,
        user_id: userId,
        source_name: "",
        source_type: null,
        frequency: null,
        expected_amount: null,
        expected_monthly: null,
        notes: null
    };

    // Load initial or empty form
    useEffect(() => {
        if (!open) return;

        if (initial) {
            setForm({ ...initial });
        } else {
            setForm({ ...emptyForm });
        }
    }, [open, initial, userId]);


    async function handleSave() {
        if (!form.source_name || form.source_name.trim() === "") {
            toast({
                title: "Missing Name",
                description: "Source name is required."
            });
            return;
        }

        const res = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: form.id ?? null,
                payload: {
                    ...form,
                    user_id: userId
                }
            })
        });

        const json = await res.json().catch(() => null);

        if (!json?.success) {
            toast({
                title: "Error",
                description: json?.error || "Could not save."
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


    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0A1E2D]">
                        {form.id ? "Edit Source" : "New Source"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
                </div>

                <SourceForm data={form} onChange={setForm} />

                <div className="mt-8 flex justify-end gap-3">
                    <button className="px-4 py-2 border rounded" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="px-4 py-2 rounded bg-[#0A1E2D] text-white" onClick={handleSave}>
                        Save
                    </button>
                </div>

            </div>
        </div>
    );
}
