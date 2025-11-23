"use client"

import { useState, useEffect } from "react"
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

    // Local state includes id + safe editable fields
    const [data, setData] = useState<Partial<IncomeSource>>({
        id: undefined,
        user_id: userId,
        source_name: "",
        source_type: null,
        frequency: null,
        expected_amount: null,
        expected_monthly: null,
        notes: null
    })

    // Load values when editing OR reset when adding
    useEffect(() => {
        if (initial) {
            setData({
                id: initial.id,
                user_id: initial.user_id,
                source_name: initial.source_name ?? "",
                source_type: initial.source_type ?? null,
                frequency: initial.frequency ?? null,
                expected_amount: initial.expected_amount ?? null,
                expected_monthly: initial.expected_monthly ?? null,
                notes: initial.notes ?? null
            })
        } else {
            setData({
                id: undefined,
                user_id: userId,
                source_name: "",
                source_type: null,
                frequency: null,
                expected_amount: null,
                expected_monthly: null,
                notes: null
            })
        }
    }, [initial, userId])

    if (!open) return null

    // ---------------------------------------------------------
    // SAVE HANDLER — FIXED FOR UPDATES
    // ---------------------------------------------------------
    async function handleSave() {
        if (!data.source_name || data.source_name.trim() === "") {
            toast({
                title: "Missing Name",
                description: "Source name is required."
            })
            return
        }

        const idToSave = data.id ?? null

        // Build safe payload (no id/user_id mutation on update)
        const payload: Partial<IncomeSource> = {
            source_name: data.source_name.trim(),
            source_type: data.source_type ?? null,
            frequency: data.frequency ?? null,
            expected_amount: data.expected_amount ?? null,
            expected_monthly: data.expected_monthly ?? null,
            notes: data.notes ?? null,
            user_id: userId // allowed only for creation, safeSource filters it for updates
        }

        const success = await saveSource(idToSave, payload)

        if (!success) {
            toast({
                title: "Error",
                description: "Could not save the source."
            })
            return
        }

        toast({
            title: idToSave ? "Updated" : "Created",
            description: "The source has been saved."
        })

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">

                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0A1E2D]">
                        {data.id ? "Edit Source" : "New Source"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                {/* FORM */}
                <SourceForm data={data} onChange={setData} />

                {/* ACTIONS */}
                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-[#0A1E2D] text-white hover:bg-[#C6A664] transition"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    )
}
