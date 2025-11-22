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

    const [data, setData] = useState<Partial<IncomeSource>>({})

    useEffect(() => {
        if (initial) {
            setData({
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

    async function handleSave() {
        if (!data.source_name?.trim()) {
            toast({
                title: "Missing name",
                description: "Source name is required"
            })
            return
        }

        const payload = {
            ...data,
            user_id: userId
        }

        const success = await saveSource(initial?.id ?? null, payload)

        if (!success) {
            toast({
                title: "Error",
                description: "Unable to save the source"
            })
            return
        }

        toast({
            title: initial ? "Updated" : "Created",
            description: "Your income source has been saved."
        })

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-[#0A1E2D]">
                        {initial ? "Edit Source" : "New Source"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>

                <SourceForm data={data} onChange={setData} />

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
