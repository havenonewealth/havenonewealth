"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
    sources: IncomeSource[]
    onUnarchive: (s: IncomeSource) => void
}

export default function ArchivedList({ sources, onUnarchive }: Props) {
    return (
        <div>
            <h2 className="text-2xl font-semibold text-[#0A1E2D] mb-4">
                Archived Sources
            </h2>

            {sources.length === 0 && (
                <p className="text-gray-600">No archived sources found.</p>
            )}

            <ul className="space-y-3">
                {sources.map((s) => (
                    <li
                        key={s.id}
                        className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-center"
                    >
                        {/* Left side */}
                        <div>
                            <p className="text-lg font-semibold text-[#0A1E2D]">
                                {s.source_name}
                            </p>

                            <p className="text-sm text-gray-600">
                                Archived on:{" "}
                                {s.archived_at
                                    ? new Date(s.archived_at).toLocaleDateString()
                                    : "Unknown"}
                            </p>
                        </div>

                        {/* Right side */}
                        <button
                            onClick={() => onUnarchive(s)}
                            className="px-4 py-2 rounded-md bg-[#0A1E2D] text-white hover:bg-[#C6A664] transition font-medium shadow-sm ml-4"
                        >
                            Restore
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
