"use client"

import { useState, useEffect } from "react"
import type { IncomeSource } from "@/lib/types"
import { saveSource } from "@/lib/supabase/sources"
import { useToast } from "@/components/ui/use-toast"
import SourceForm, { SourceFormValues } from "./SourceForm"

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

    if (!open) return null

    async function handleSubmit(values: SourceFormValues) {
        const payload = { ...values, user_id: userId }

        const success = await saveSource(initial?.id ?? null, payload)

        if (success) {
            toast({
                title: initial ? "Updated" : "Created",
                description: "Your income source has been saved."
            })
            onSaved()
            onClose()
        } else {
            toast({ title: "Error", description: "Failed to save source." })
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full p-6 shadow-xl overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {initial ? "Edit Source" : "New Source"}
                    </h2>
                    <button onClick={onClose}>✕</button>
                </div>

                <SourceForm initial={initial} onSubmit={handleSubmit} />

            </div>
        </div>
    )
}
