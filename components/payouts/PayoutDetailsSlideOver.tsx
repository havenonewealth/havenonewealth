"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import type { RecentPayout } from "@/lib/types";

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    payout: RecentPayout | null;
}

export default function PayoutDetailsSlideOver({
    open,
    setOpen,
    payout
}: Props) {
    if (!payout) return null;

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={setOpen}
            >
                {/* Overlay */}
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

                                {/* Header */}
                                <div className="p-6 border-b flex justify-between items-center">
                                    <Dialog.Title className="text-lg font-semibold">
                                        Payout Details
                                    </Dialog.Title>

                                    <button
                                        className="text-gray-400 hover:text-gray-600"
                                        onClick={() => setOpen(false)}
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Body */}
                                <div className="p-6 space-y-6 overflow-y-auto">

                                    {/* Amount */}
                                    <div>
                                        <div className="text-sm text-gray-500">Amount</div>
                                        <div className="text-2xl font-semibold">
                                            ${payout.amount.toLocaleString("en-US")}
                                        </div>
                                    </div>

                                    {/* Payment Date */}
                                    <div>
                                        <div className="text-sm text-gray-500">Payment Date</div>
                                        <div className="text-lg">
                                            {new Date(payout.payout_date).toLocaleDateString()}
                                        </div>
                                    </div>

                                    {/* Source */}
                                    <div>
                                        <div className="text-sm text-gray-500">Source</div>
                                        <div className="text-lg font-medium">
                                            {payout.source_name || "Unknown"}
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div>
                                        <div className="text-sm text-gray-500">Status</div>

                                        <span
                                            className={`inline-block mt-1 px-3 py-1 text-xs rounded-full font-semibold ${payout.status === "Paid"
                                                    ? "bg-green-100 text-green-700"
                                                    : payout.status === "Pending"
                                                        ? "bg-yellow-100 text-yellow-700"
                                                        : payout.status === "Scheduled"
                                                            ? "bg-blue-100 text-blue-700"
                                                            : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {payout.status}
                                        </span>
                                    </div>

                                </div>

                                {/* Footer */}
                                <div className="border-t p-4 flex justify-end">
                                    <button
                                        onClick={() => setOpen(false)}
                                        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
                                    >
                                        Close
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
