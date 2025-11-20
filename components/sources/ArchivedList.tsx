"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    sources: IncomeSource[]
    onUnarchive: (id: string) => void
}

export default function ArchivedList({ sources, onUnarchive }: Props) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <h2 className="text-2xl font-semibold">Archived Sources</h2>

            {/* List */}
            <div className="space-y-3">
                {sources.map((s) => (
                    <div
                        key={s.id}
                        className="p-4 border rounded-lg shadow-sm bg-gray-50"
                    >
                        <div className="flex justify-between items-center">

                            {/* NAME */}
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-[#0A1E2D]">
                                    {s.source_name}
                                </p>

                                {s.archived_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Archived on {new Date(s.archived_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {/* UNARCHIVE BUTTON */}
                            <button
                                onClick={() => onUnarchive(s.id)}
                                className="ml-4 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 border border-blue-300 rounded hover:bg-blue-200 transition"
                            >
                                Unarchive
                            </button>
                        </div>
                    </div>
                ))}

                {sources.length === 0 && (
                    <p className="text-gray-500 italic">No archived sources.</p>
                )}
            </div>
        </div>
    )
}
