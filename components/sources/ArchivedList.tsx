"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    sources: IncomeSource[]
    onUnarchive: (source: IncomeSource) => void
}

export default function ArchivedList({ sources, onUnarchive }: Props) {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-[#0A1E2D]">
                    Archived Sources
                </h2>
            </div>

            {sources.length === 0 && (
                <p className="text-gray-500">No archived sources.</p>
            )}

            <ul className="space-y-3">
                {sources.map((s) => (
                    <li
                        key={s.id}
                        className="p-4 border rounded-lg shadow-sm bg-white"
                    >
                        <div className="flex justify-between items-start">
                            {/* Source info */}
                            <div className="flex-1">
                                <p className="text-lg font-semibold text-[#0A1E2D]">
                                    {s.source_name}
                                </p>

                                {s.archived_at && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        Archived {new Date(s.archived_at).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            {/* Restore button */}
                            <button
                                onClick={() => onUnarchive(s)}
                                className="px-3 py-1 rounded bg-[#0A1E2D] text-white hover:bg-[#C6A664] transition ml-4"
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
