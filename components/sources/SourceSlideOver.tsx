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
                source_type: "",
                frequency: "",
                expected_amount: null,
                expected_monthly: null,
                notes: ""
            })
        }
    }, [initial])

    if (!open) return null

    async function handleSave() {
        if (!data.source_name || data.source_name.trim() === "") {
            toast({
                title: "Source name required",
                description: "Please enter a name"
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
                description: "Source could not be saved"
            })
            return
        }

        toast({
            title: initial ? "Updated" : "Created",
            description: "Your source has been saved"
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
                        {initial ? "Edit Source" : "New Source"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        ✕
                    </button>
                </div>

                <SourceForm data={data} onChange={setData} />

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700"
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
