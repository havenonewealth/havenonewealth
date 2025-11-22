"use client"

import { useEffect, useState } from "react"
import { IncomeSource } from "@/lib/types"
import { getSourceById, saveSource } from "@/lib/supabase/sources"
import { useToast } from "@/components/ui/use-toast"
import SourceForm from "./SourceForm"

interface Props {
    sourceId: string | null
    userId: string
    open: boolean
    onClose: () => void
    onSaved: () => void
}

export default function SourceSlideOver({
    sourceId,
    userId,
    open,
    onClose,
    onSaved
}: Props) {

    const { toast } = useToast()

    const [data, setData] = useState<Partial<IncomeSource>>({
        source_name: "",
        source_type: null,
        frequency: null,
        expected_amount: null,
        expected_monthly: null,
        notes: null
    })

    useEffect(() => {
        async function load() {
            if (!sourceId) {
                setData({
                    source_name: "",
                    source_type: null,
                    frequency: null,
                    expected_amount: null,
                    expected_monthly: null,
                    notes: null
                })
                return
            }

            const row = await getSourceById(sourceId)
            if (row) setData(row)
        }

        if (open) load()
    }, [open, sourceId])

    if (!open) return null

    async function handleSave() {
        if (!data.source_name || data.source_name.trim() === "") {
            toast({ title: "Missing Name", description: "Source name is required." })
            return
        }

        const success = await saveSource(sourceId, { ...data, user_id: userId })
        if (!success) {
            toast({ title: "Error", description: "Unable to save source." })
            return
        }

        toast({
            title: sourceId ? "Updated" : "Created",
            description: "Source saved successfully."
        })

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex justify-end z-40">
            <div className="bg-white w-full max-w-md h-full p-6 shadow-xl overflow-y-auto">

                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {sourceId ? "Edit Source" : "New Source"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500">✕</button>
                </div>

                <SourceForm data={data} onChange={setData} />

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 rounded border">
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-[#0A1E2D] text-white hover:bg-[#C6A664]"
                    >
                        Save
                    </button>
                </div>

            </div>
        </div>
    )
}
