"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd: () => void
  onEdit: (s: IncomeSource) => void
  onArchive: (id: string) => void
}

export default function SourceList({
  sources,
  onAdd,
  onEdit,
  onArchive
}: Props) {
  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Income Sources</h2>

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664] hover:text-[#0A1E2D] transition"
        >
          Add Source
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {sources.map((s) => (
          <div
            key={s.id}
            className="p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition cursor-pointer"
          >
            <div className="flex justify-between items-center">

              {/* NAME + CLICK TO EDIT */}
              <div
                className="flex-1"
                onClick={() => onEdit(s)}
              >
                <p className="text-lg font-semibold text-[#0A1E2D]">
                  {s.source_name}
                </p>

                <p className="text-sm text-gray-600">
                  {(s.source_type || s.frequency) && (
                    <>
                      {s.source_type ? `${s.source_type} • ` : ""}
                      {s.frequency ? `${s.frequency} • ` : ""}
                    </>
                  )}
                  {s.expected_amount !== null &&
                    `$${s.expected_amount.toLocaleString()}`}
                </p>
              </div>

              {/* ARCHIVE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onArchive(s.id)
                }}
                className="ml-4 px-3 py-1.5 text-sm bg-red-100 text-red-700 border border-red-300 rounded hover:bg-red-200 transition"
              >
                Archive
              </button>
            </div>
          </div>
        ))}

        {sources.length === 0 && (
          <p className="text-gray-500 italic">No active sources found.</p>
        )}
      </div>
    </div>
  )
}
