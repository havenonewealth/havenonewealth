"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment, useState } from "react"
import type { IncomeSource } from "@/lib/types"
import SourceForm from "./SourceForm"
import { deleteSource } from "@/lib/supabase/sources"

interface Props {
    initial?: IncomeSource | null
    userId: string
    open: boolean
    onClose: () => void
    onSaved: () => void
}

export default function SourceSlideOver({
    initial = null,
    userId,
    open,
    onClose,
    onSaved
}: Props) {

    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)

    async function handleDelete() {
        if (!initial?.id) return
        try {
            setDeleting(true)
            await deleteSource(initial.id)
            setDeleting(false)
            setConfirmOpen(false)
            onSaved()
            onClose()
        } catch (err) {
            console.error("Delete error:", err)
            setDeleting(false)
        }
    }

    return (
        <>
            {/* MAIN SLIDEOVER */}
            <Transition.Root show={open} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={onClose}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-gray-900/50" />
                    </Transition.Child>

                    <div className="fixed inset-0 overflow-hidden">
                        <div className="absolute inset-0 flex max-w-full pl-10">
                            <Transition.Child
                                as={Fragment}
                                enter="transform transition ease-in-out duration-300"
                                enterFrom="translate-x-full"
                                enterTo="translate-x-0"
                                leave="transform transition ease-in-out duration-200"
                                leaveFrom="translate-x-0"
                                leaveTo="translate-x-full"
                            >
                                <Dialog.Panel className="w-screen max-w-md bg-white shadow-xl">
                                    <div className="h-full flex flex-col">
                                        <div className="px-6 py-4 border-b flex justify-between items-center">
                                            <Dialog.Title className="text-lg font-semibold">
                                                {initial ? "Edit Source" : "Add Source"}
                                            </Dialog.Title>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6">
                                            <SourceForm
                                                initial={initial ?? null}
                                                userId={userId}
                                                onSaved={onSaved}
                                                onClose={onClose}
                                            />
                                        </div>

                                        {/* DELETE BUTTON — only when editing */}
                                        {initial && (
                                            <div className="p-6 border-t">
                                                <button
                                                    onClick={() => setConfirmOpen(true)}
                                                    className="w-full text-center py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700"
                                                >
                                                    Delete Source
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </Dialog.Panel>
                            </Transition.Child>
                        </div>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* CONFIRM DELETE MODAL */}
            <Transition.Root show={confirmOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={setConfirmOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black/40" />
                    </Transition.Child>

                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="scale-95 opacity-0"
                            enterTo="scale-100 opacity-100"
                            leave="ease-in duration-200"
                            leaveFrom="scale-100 opacity-100"
                            leaveTo="scale-95 opacity-0"
                        >
                            <Dialog.Panel className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
                                <Dialog.Title className="text-lg font-semibold text-gray-900">
                                    Delete Source
                                </Dialog.Title>

                                <p className="mt-3 text-gray-700">
                                    Are you sure you want to permanently delete this source?
                                </p>

                                <div className="mt-6 flex justify-end gap-3">
                                    <button
                                        onClick={() => setConfirmOpen(false)}
                                        className="px-4 py-2 rounded-md border border-gray-300"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50"
                                    >
                                        {deleting ? "Deleting…" : "Delete"}
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>
        </>
    )
}
