"use client"

import { useState } from "react"
import type { IncomeSource } from "@/lib/types"
import { saveSource } from "@/lib/supabase/sources"
import { useToast } from "@/components/ui/use-toast"

interface Props {
    initial: IncomeSource | null
    userId: string
    onSaved: () => void
}

export default function SourceForm({ initial, userId, onSaved }: Props) {
    const { toast } = useToast()

    const [form, setForm] = useState({
        source_name: initial?.source_name ?? "",
        source_type: initial?.source_type ?? "",
        frequency: initial?.frequency ?? "",
        expected_amount: initial?.expected_amount ?? 0,
        notes: initial?.notes ?? ""
    })

    function update<K extends keyof typeof form>(key: K, val: any) {
        setForm({ ...form, [key]: val })
    }

    async function submit() {
        await saveSource({
            id: initial?.id,
            user_id: userId,
            ...form
        })

        toast({ title: "Saved", description: "Income source updated." })
        onSaved()
    }

    return (
        <div className="space-y-4">

            <div>
                <label className="block mb-1 font-medium">Source Name</label>
                <input
                    value={form.source_name}
                    onChange={(e) => update("source_name", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Source Type</label>
                <input
                    value={form.source_type}
                    onChange={(e) => update("source_type", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Frequency</label>
                <input
                    value={form.frequency}
                    onChange={(e) => update("frequency", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Expected Amount</label>
                <input
                    type="number"
                    value={form.expected_amount}
                    onChange={(e) => update("expected_amount", Number(e.target.value))}
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            <div>
                <label className="block mb-1 font-medium">Notes</label>
                <textarea
                    value={form.notes}
                    onChange={(e) => update("notes", e.target.value)}
                    className="border px-3 py-2 rounded w-full"
                />
            </div>

            <button
                onClick={submit}
                className="w-full bg-[#0A1E2D] text-white py-2 rounded-md"
            >
                Save
            </button>
        </div>
    )
}
