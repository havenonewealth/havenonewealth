"use client";

import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { createClient } from "@/lib/supabaseClient";
import type { RecentPayout } from "@/lib/types";

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    payout: RecentPayout | null;
    sources: { id: string; source_name: string }[];
    refreshAll: () => void;
}

export default function PayoutEditSlideOver({
    open,
    setOpen,
    payout,
    sources,
    refreshAll
}: Props) {
    const supabase = createClient();

    if (!payout) return null;

    // Normalize date for date input (YYYY-MM-DD)
    const normalizedDate =
        payout.payout_date
            ? new Date(payout.payout_date).toISOString().substring(0, 10)
            : "";

    // Local state
    const [amount, setAmount] = useState<number>(payout.amount);
    const [status, setStatus] = useState<string>(payout.status);
    const [date, setDate] = useState<string>(normalizedDate);
    const [sourceId, setSourceId] = useState<string>(payout.source_id || "");
    const [notes, setNotes] = useState<string>(payout.notes ?? "");

    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);

        await supabase
            .from("payouts")
            .update({
                amount,
                status,
                payment_date: date,
                source_id: sourceId,
                notes: notes.trim() === "" ? null : notes
            })
            .eq("id", payout.id);

        setSaving(false);

        refreshAll();
        setOpen(false);
    };

    const handleDelete = async () => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this payout?"
        );
        if (!confirmed) return;

        await supabase.from("payouts").delete().eq("id", payout.id);

        refreshAll();
        setOpen(false);
    };

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
                {/* Background overlay */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/30" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-hidden">
                    <div className="absolute inset-y-0 right-0 flex max-w-full pl-10">

                        {/* Slide-over panel */}
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="w-screen max-w-md bg-white shadow-xl flex flex-col">

                                {/* HEADER */}
                                <div className="p-6 border-b flex justify-between items-center">
                                    <Dialog.Title className="text-lg font-semibold">
                                        Edit Payout
                                    </Dialog.Title>

                                    <button
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={() => setOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* BODY */}
                                <div className="p-6 space-y-6 overflow-y-auto">

                                    {/* AMOUNT */}
                                    <div>
                                        <label className="text-sm text-gray-600">Amount</label>
                                        <input
                                            type="number"
                                            className="mt-1 w-full border rounded px-3 py-2"
                                            value={amount}
                                            onChange={(e) =>
                                                setAmount(Number(e.target.value))
                                            }
                                        />
                                    </div>

                                    {/* DATE */}
                                    <div>
                                        <label className="text-sm text-gray-600">Payment Date</label>
                                        <input
                                            type="date"
                                            className="mt-1 w-full border rounded px-3 py-2"
                                            value={date}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>

                                    {/* STATUS */}
                                    <div>
                                        <label className="text-sm text-gray-600">Status</label>
                                        <select
                                            className="mt-1 w-full border rounded px-3 py-2"
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                    </div>

                                    {/* SOURCE */}
                                    <div>
                                        <label className="text-sm text-gray-600">Source</label>
                                        <select
                                            className="mt-1 w-full border rounded px-3 py-2"
                                            value={sourceId}
                                            onChange={(e) => setSourceId(e.target.value)}
                                        >
                                            {sources.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.source_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* NOTES */}
                                    <div>
                                        <label className="text-sm text-gray-600">Notes</label>
                                        <textarea
                                            rows={4}
                                            className="mt-1 w-full border rounded px-3 py-2"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                        />
                                    </div>

                                </div>

                                {/* FOOTER */}
                                <div className="border-t p-4 flex justify-between">

                                    {/* DELETE */}
                                    <button
                                        onClick={handleDelete}
                                        className="px-4 py-2 text-red-600 hover:underline"
                                    >
                                        Delete
                                    </button>

                                    {/* ACTIONS */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-2 bg-gray-200 rounded"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
                                        >
                                            {saving ? "Saving..." : "Save Changes"}
                                        </button>
                                    </div>

                                </div>

                            </Dialog.Panel>
                        </Transition.Child>

                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    );
}
