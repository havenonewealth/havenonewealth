"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    sources: IncomeSource[]
    onUnarchive: (id: string) => void
}

export default function ArchivedList({ sources, onUnarchive }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Archived Sources</h2>

            {sources.length === 0 && (
                <p className="text-gray-500">No archived sources.</p>
            )}

            <ul className="space-y-3">
                {sources.map((s) => (
                    <li
                        key={s.id}
                        className="p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                <p className="text-lg font-semibold">{s.source_name}</p>

                                {s.archived_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Archived {new Date(s.archived_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <button
                                onClick={() => onUnarchive(s.id)}
                                className="ml-4 text-blue-600 hover:text-blue-800 font-medium"
                            >
                                Unarchive
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    )
}
