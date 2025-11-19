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
    onSaved: () => void      // refresh after save OR delete
}

export default function SourceSlideOver({
    initial = null,
    userId,
    open,
    onClose,
    onSaved
}: Props) {

    const [deleteLoading, setDeleteLoading] = useState(false)

    async function handleDelete() {
        if (!initial?.id) return
        const ok = confirm("Are you sure you want to delete this income source?")

        if (!ok) return

        try {
            setDeleteLoading(true)
            await deleteSource(initial.id)
            onSaved()     // refresh list
            onClose()     // close panel
        } catch (err) {
            console.error("Delete error:", err)
            alert("Could not delete source. Check console for details.")
        } finally {
            setDeleteLoading(false)
        }
    }

    return (
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

                                    {/* HEADER */}
                                    <div className="px-6 py-4 border-b flex justify-between items-center">
                                        <Dialog.Title className="text-lg font-semibold">
                                            {initial ? "Edit Source" : "Add Source"}
                                        </Dialog.Title>

                                        {initial && (
                                            <button
                                                onClick={handleDelete}
                                                disabled={deleteLoading}
                                                className="text-red-600 text-sm hover:underline"
                                            >
                                                {deleteLoading ? "Deleting…" : "Delete"}
                                            </button>
                                        )}
                                    </div>

                                    {/* FORM */}
                                    <div className="flex-1 overflow-y-auto p-6">
                                        <SourceForm
                                            initial={initial ?? null}
                                            userId={userId}
                                            onSaved={() => {
                                                onSaved()
                                                onClose()
                                            }}
                                            onClose={onClose}
                                        />
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>

            </Dialog>
        </Transition.Root>
    )
}
