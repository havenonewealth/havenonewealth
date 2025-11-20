"use client"

import { Dialog, Transition } from "@headlessui/react"
import { Fragment } from "react"
import type { IncomeSource } from "@/lib/types"
import SourceForm from "./SourceForm"

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
    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Background */}
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

                {/* Slide-over */}
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

                                    {/* Header */}
                                    <div className="px-6 py-4 border-b">
                                        <Dialog.Title className="text-lg font-semibold">
                                            {initial ? "Edit Source" : "Add Source"}
                                        </Dialog.Title>
                                    </div>

                                    {/* Form */}
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
