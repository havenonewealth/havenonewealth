"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    archived: IncomeSource[]
    onRestore: (id: string) => void
}

export default function ArchiveList({ archived, onRestore }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Archived Sources</h2>

            {archived.length === 0 && (
                <p className="text-gray-500">No archived income sources.</p>
            )}

            <ul className="space-y-3">
                {archived.map((s) => (
                    <li
                        key={s.id}
                        className="p-4 border rounded-lg bg-gray-100 opacity-80 shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-lg font-semibold text-gray-700">
                                    {s.source_name}
                                </p>
                                <p className="text-sm text-gray-500">
                                    {s.source_type && <span>{s.source_type} • </span>}
                                    {s.frequency && <span>{s.frequency} • </span>}
                                    {s.expected_amount && (
                                        <span>${s.expected_amount.toLocaleString()}</span>
                                    )}
                                </p>
                            </div>

                            <button
                                onClick={() => onRestore(s.id)}
                                className="ml-4 text-blue-700 hover:text-blue-900 font-medium"
                            >
                                Restore
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
