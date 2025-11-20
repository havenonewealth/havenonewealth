"use client"

import { useState, useEffect } from "react"
import SourceForm from "./SourceForm"
import type { IncomeSource } from "@/lib/types"

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
    const [data, setData] = useState<IncomeSource | null>(initial)

    useEffect(() => {
        setData(initial)
    }, [initial])

    if (!open) return null

    return (
        <div className="fixed inset-0 bg-black/40 z-40 flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-xl p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">
                        {data ? "Edit Source" : "Add Source"}
                    </h2>
                    <button onClick={onClose} className="text-lg">×</button>
                </div>

                <SourceForm
                    initial={data}
                    userId={userId}
                    onSaved={() => {
                        onSaved()
                        onClose()
                    }}
                />
            </div>
        </div>
    )
}
