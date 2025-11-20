"use client"

import { Fragment } from "react"
import { Dialog, Transition } from "@headlessui/react"
import { IncomeSource } from "@/lib/types"
import { saveSource } from "@/lib/supabase/sources"
import { useToast } from "@/components/ui/use-toast"
import SourceForm from "./SourceForm"

interface Props {
    initial: IncomeSource | null
    userId: string
    open: boolean
    onClose: () => void
    onSaved: () => void
}

export default function SourceSlideOver({
    initial,
    userId,
    open,
    onClose,
    onSaved
}: Props) {

    const { toast } = useToast()

    async function handleSubmit(values: {
        source_name: string
        source_type: string | null
        frequency: string | null
        expected_amount: number | null
        expected_monthly: number | null
        notes: string | null
    }) {
        const payload = {
            user_id: userId,
            source_name: values.source_name,
            source_type: values.source_type,
            frequency: values.frequency,
            expected_amount: values.expected_amount,
            expected_monthly: values.expected_monthly,
            notes: values.notes
        }

        const success = await saveSource(initial?.id ?? null, payload)

        if (success) {
            toast({
                title: initial ? "Updated" : "Created",
                description: "Your income source has been saved."
            })
            onSaved()
            onClose()
        } else {
            toast({
                title: "Error",
                description: "Something went wrong while saving."
            })
        }
    }

    return (
        <Transition.Root show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-50"
                onClose={onClose}
            >
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
                    <div className="absolute inset-0 overflow-hidden flex justify-end">
                        <Transition.Child
                            as={Fragment}
                            enter="transform transition ease-in-out duration-300"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transform transition ease-in-out duration-200"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="w-screen max-w-md h-full bg-white shadow-xl p-6 overflow-y-auto">

                                {/* Header */}
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title className="text-xl font-semibold text-[#0A1E2D]">
                                        {initial ? "Edit Income Source" : "New Income Source"}
                                    </Dialog.Title>

                                    <button
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ✕
                                    </button>
                                </div>

                                {/* Form */}
                                <SourceForm
                                    initial={initial}
                                    userId={userId}
                                    onSubmit={handleSubmit}
                                />

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>

            </Dialog>
        </Transition.Root>
    )
}
