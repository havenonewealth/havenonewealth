"use client"

import { useState, useEffect } from "react"
import { IncomeSource } from "@/lib/types"
import { useToast } from "@/components/ui/use-toast"
import SourceForm from "./SourceForm"

export default function SourceSlideOver({
    initial,
    userId,
    open,
    onClose,
    onSaved
}: {
    initial: IncomeSource | null
    userId: string
    open: boolean
    onClose: () => void
    onSaved: () => void
}) {
    const { toast } = useToast()

    const [form, setForm] = useState<Partial<IncomeSource>>({
        user_id: userId
    })

    useEffect(() => {
        if (!open) return

        if (initial) {
            setForm({ ...initial })
        } else {
            setForm({
                user_id: userId,
                source_name: "",
                source_type: null,
                frequency: null,
                expected_amount: null,
                expected_monthly: null,
                notes: null
            })
        }
    }, [initial, open, userId])

    if (!open) return null

    async function handleSave() {
        if (!form.source_name?.trim()) {
            toast({
                title: "Missing name",
                description: "Source name is required."
            })
            return
        }

        const res = await fetch("/api/sources/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id: form.id ?? null,
                payload: form
            })
        })

        const json = await res.json()

        if (!json.success) {
            toast({
                title: "Save failed",
                description: json.error || "Unable to save source."
            })
            return
        }

        toast({
            title: form.id ? "Updated" : "Created",
            description: "Source saved successfully."
        })

        onSaved()
        onClose()
    }

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="bg-white w-full max-w-md h-full p-6 shadow-xl overflow-y-auto">

                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold">
                        {form.id ? "Edit Source" : "New Source"}
                    </h2>
                    <button onClick={onClose} className="text-gray-500">✕</button>
                </div>

                <SourceForm data={form} onChange={setForm} />

                <div className="mt-8 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded border"
                    >
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
