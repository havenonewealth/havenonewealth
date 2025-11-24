"use client";

import { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { supabase } from "@/lib/supabaseClient";
import SourceForm from "./SourceForm";
import type { IncomeSource } from "@/lib/types";

interface SlideProps {
    open: boolean;
    setOpen: (v: boolean) => void;
    editing: IncomeSource | null;
    refresh: () => void;
    userId: string | null;
}

// -----------------------------------------------------------------------------
// Frequency → Monthly Calculation (MUST match SourceForm)
// -----------------------------------------------------------------------------
function computeMonthly(expected_amount: number, frequency: string | null) {
    if (!expected_amount || expected_amount <= 0) return null;

    switch (frequency) {
        case "Weekly":
            return parseFloat((expected_amount * 4.345).toFixed(2));
        case "Bi-Weekly":
            return parseFloat((expected_amount * 2.172).toFixed(2));
        case "Monthly":
            return expected_amount;
        case "Quarterly":
            return parseFloat((expected_amount / 3).toFixed(2));
        case "Annual":
            return parseFloat((expected_amount / 12).toFixed(2));
        case "One-Time":
            return expected_amount;
        case "Varies":
            return expected_amount;
        default:
            return expected_amount;
    }
}

export default function SourceSlideOver({
    open,
    setOpen,
    editing,
    refresh,
    userId
}: SlideProps) {
    // Form matches Partial<IncomeSource>
    const [form, setForm] = useState<Partial<IncomeSource>>({
        source_name: "",
        source_type: "",
        frequency: "Monthly",
        expected_amount: null,
        expected_monthly: null,
        notes: ""
    });

    // Pre-fill form when editing or reset when adding new
    useEffect(() => {
        if (editing) {
            setForm({
                source_name: editing.source_name || "",
                source_type: editing.source_type || "",
                frequency: editing.frequency || "Monthly",
                expected_amount: editing.expected_amount ?? null,
                expected_monthly: editing.expected_monthly ?? null,
                notes: editing.notes ?? ""
            });
        } else {
            setForm({
                source_name: "",
                source_type: "",
                frequency: "Monthly",
                expected_amount: null,
                expected_monthly: null,
                notes: ""
            });
        }
    }, [editing]);

    // ---------------------------------------------------------------------------
    // SAVE HANDLER: CREATE or UPDATE
    // ---------------------------------------------------------------------------
    const handleSave = async () => {
        if (!userId) return;

        const expAmt = form.expected_amount ?? 0;

        if (!expAmt || expAmt <= 0) {
            alert("Expected amount is required.");
            return;
        }

        const monthly = computeMonthly(expAmt, form.frequency || "Monthly");

        const payload: Partial<IncomeSource> = {
            user_id: userId,
            source_name: form.source_name?.trim() || "",
            source_type: form.source_type?.trim() || "",
            frequency: form.frequency ?? "Monthly",
            expected_amount: expAmt,
            expected_monthly: monthly,
            notes: form.notes?.trim() || null
        };

        if (editing?.id) {
            // UPDATE
            await supabase.from("income_sources").update(payload).eq("id", editing.id);
        } else {
            // CREATE
            await supabase.from("income_sources").insert(payload);
        }

        refresh();
        setOpen(false);
    };

    // ---------------------------------------------------------------------------

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                <Transition.Child
                    as={Fragment}
                    enter="transition-opacity ease duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity ease duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-in-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in-out duration-300"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="w-screen max-w-md bg-white shadow-xl p-6 space-y-6">
                                <Dialog.Title className="text-xl font-semibold">
                                    {editing ? "Edit Source" : "Add Source"}
                                </Dialog.Title>

                                {/* PASS FORM STATE */}
                                <SourceForm data={form} onChange={setForm} />

                                <div className="pt-4 flex justify-end space-x-3">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-2 border rounded"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleSave}
                                        className="px-4 py-2 bg-black text-white rounded"
                                    >
                                        Save Source
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
