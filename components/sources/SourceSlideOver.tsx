"use client"

import { useEffect, useState } from "react"
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

    // ------------------------------------------------------------------
    // LOCAL FORM STATE
    // ------------------------------------------------------------------
    const [data, setData] = useState<Partial<IncomeSource>>({})

    useEffect(() => {
        if (initial) {
            setData({
                id: initial.id,
                source_name: initial.source_name,
                source_type: initial.source_type,
                frequency: initial.frequency,
                expected_amount: initial.expected_amount,
                expected_monthly: initial.expected_monthly,
                notes: initial.notes
            })
        } else {
            setData({
                source_name: "",
                source_type: null,
                frequency: null,
                expected_amount: null,
                expected_monthly: null,
                notes: null
            })
        }
    }, [initial])

    if (!open) return null

    // ------------------------------------------------------------------
    // SAVE HANDLER
    // ------------------------------------------------------------------
    async function handleSave() {
        if (!data.source_name || data.source_name.trim() === "") {
            toast({
                title: "Source name required",
                description: "Please enter a valid source name."
            })
            return
        }

        const recordId = initial?.id ?? null

        const payload = {
            source_name: data.source_name?.trim() ?? "",
            source_type: data.source_type ?? null,
            frequency: data.frequency ?? null,
            expected_amount: data.expected_amount ?? null,
            expected_monthly: data.expected_monthly ?? null,
            notes: data.notes ?? null,
            user_id: userId
        }

        console.log("SAVE — id=", recordId)
        console.log("SAVE — payload=", payload)

        const ok = await saveSource(recordId, payload)

        if (!ok) {
            toast({
                title: "Save failed",
                description: "Unable to save changes. Please retry."
            })
            return
        }

        toast({
            title: initial ? "Updated" : "Created",
            description: "Source saved successfully."
        })

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/30 flex justify-end z-50">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">

                {/* HEADER */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0A1E2D]">
                        {initial ? "Edit Source" : "New Source"}
                    </h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        onClick={onClose}
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
                        className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-[#0A1E2D] text-white rounded hover:bg-[#C6A664]"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    )
}
