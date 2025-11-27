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
    role: string | null;
}

export default function PayoutEditSlideOver({
    open,
    setOpen,
    payout,
    sources,
    refreshAll,
    role
}: Props) {
    const supabase = createClient();

    if (!payout) return null;

    const isAdmin = role === "admin";

    const [amount, setAmount] = useState(payout.amount);
    const [status, setStatus] = useState(payout.status);
    const [date, setDate] = useState(payout.payout_date);
    const [sourceId, setSourceId] = useState(payout.source_id);
    const [notes, setNotes] = useState(payout.notes ?? "");

    const handleSave = async () => {
        const payload: any = {
            notes
        };

        // Admins can update all fields
        if (isAdmin) {
            payload.amount = amount;
            payload.status = status;
            payload.payment_date = date;
            payload.source_id = sourceId;
        }

        await supabase
            .from("payouts")
            .update(payload)
            .eq("id", payout.id);

        refreshAll();
        setOpen(false);
    };

    const handleDelete = async () => {
        if (!isAdmin) return;

        const confirmed = window.confirm("Are you sure you want to delete this payout?");
        if (!confirmed) return;

        await supabase
            .from("payouts")
            .delete()
            .eq("id", payout.id);

        refreshAll();
        setOpen(false);
    };

    const lockClass = "bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed";

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={setOpen}>
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
                                    <Dialog.Title className="text-lg font-semibold">Edit Payout</Dialog.Title>
                                    <button
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={() => setOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* BODY */}
                                <div className="p-6 space-y-6 overflow-y-auto">

                                    {/* AMOUNT (ADMIN ONLY) */}
                                    <div>
                                        <label className="text-sm text-gray-600">Amount</label>
                                        <input
                                            type="number"
                                            disabled={!isAdmin}
                                            className={`mt-1 w-full border rounded px-3 py-2 ${!isAdmin ? lockClass : ""
                                                }`}
                                            value={amount}
                                            onChange={(e) => setAmount(Number(e.target.value))}
                                        />
                                    </div>

                                    {/* DATE (ADMIN ONLY) */}
                                    <div>
                                        <label className="text-sm text-gray-600">Payment Date</label>
                                        <input
                                            type="date"
                                            disabled={!isAdmin}
                                            className={`mt-1 w-full border rounded px-3 py-2 ${!isAdmin ? lockClass : ""
                                                }`}
                                            value={date.substring(0, 10)}
                                            onChange={(e) => setDate(e.target.value)}
                                        />
                                    </div>

                                    {/* STATUS (ADMIN ONLY) */}
                                    <div>
                                        <label className="text-sm text-gray-600">Status</label>
                                        <select
                                            disabled={!isAdmin}
                                            className={`mt-1 w-full border rounded px-3 py-2 ${!isAdmin ? lockClass : ""
                                                }`}
                                            value={status}
                                            onChange={(e) => setStatus(e.target.value)}
                                        >
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="Failed">Failed</option>
                                        </select>
                                    </div>

                                    {/* SOURCE (ADMIN ONLY) */}
                                    <div>
                                        <label className="text-sm text-gray-600">Source</label>
                                        <select
                                            disabled={!isAdmin}
                                            className={`mt-1 w-full border rounded px-3 py-2 ${!isAdmin ? lockClass : ""
                                                }`}
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

                                    {/* NOTES (ALWAYS EDITABLE) */}
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

                                    {/* DELETE — ADMIN ONLY */}
                                    {isAdmin ? (
                                        <button
                                            onClick={handleDelete}
                                            className="px-4 py-2 text-red-600 hover:underline"
                                        >
                                            Delete
                                        </button>
                                    ) : (
                                        <div />
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setOpen(false)}
                                            className="px-4 py-2 bg-gray-200 rounded"
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-2 bg-black text-white rounded"
                                        >
                                            Save Changes
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
