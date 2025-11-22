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

    console.log("SLIDEOVER: mounted with initial =", initial)

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

    useEffect(() => {
        console.log("SLIDEOVER: useEffect triggered with initial =", initial)

        if (initial) {
            setData({
                id: initial.id,
                user_id: initial.user_id,
                source_name: initial.source_name,
                source_type: initial.source_type,
                frequency: initial.frequency,
                expected_amount: initial.expected_amount,
                expected_monthly: initial.expected_monthly,
                notes: initial.notes
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

    async function handleSave() {
        console.log("SLIDEOVER: handleSave() fired")
        console.log("SLIDEOVER: data BEFORE save =", data)

        const idToSave = data.id ?? null
        console.log("SLIDEOVER: idToSave =", idToSave)

        const payload = {
            ...data,
            user_id: userId
        }

        console.log("SLIDEOVER: payload sent to saveSource =", payload)

        const success = await saveSource(idToSave, payload)

        console.log("SLIDEOVER: saveSource returned =", success)

        if (!success) {
            toast({ title: "Error", description: "Unable to save source" })
            return
        }

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">
                        {data.id ? "Edit Source" : "New Source"}
                    </h2>

                    <button onClick={onClose} className="text-gray-600 text-xl">✕</button>
                </div>

                <SourceForm data={data} onChange={setData} />

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="border px-4 py-2 rounded">
                        Cancel
                    </button>

                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded bg-[#0A1E2D] text-white"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}
