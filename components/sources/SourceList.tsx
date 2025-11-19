"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd?: () => void
  onEdit?: (s: IncomeSource) => void
  onDelete: (id: string) => void
  archivedMode?: boolean   // NEW: tells us if we’re in Archived tab
}

export default function SourceList({
  sources,
  onAdd,
  onEdit,
  onDelete,
  archivedMode = false
}: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">
          {archivedMode ? "Archived Sources" : "Income Sources"}
        </h2>

        {!archivedMode && onAdd && (
          <button
            onClick={onAdd}
            className="px-4 py-2 bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664] transition"
          >
            Add Source
          </button>
        )}
      </div>

      {/* List */}
      <ul className="space-y-3">
        {sources.map((s) => (
          <li
            key={s.id}
            className={`p-4 border rounded-lg shadow-sm transition flex justify-between items-center ${archivedMode ? "bg-gray-100 opacity-70" : "hover:bg-gray-50"
              }`}
          >
            {/* LEFT AREA (info) */}
            <div
              className={`flex-1 ${!archivedMode ? "cursor-pointer" : "cursor-default"
                }`}
              onClick={() => !archivedMode && onEdit && onEdit(s)}
            >
              <p className="text-lg font-semibold">{s.source_name}</p>

              <p className="text-sm text-gray-600">
                {s.source_type && <span>{s.source_type} • </span>}
                {s.frequency && <span>{s.frequency} • </span>}
                {s.expected_amount && (
                  <span>${s.expected_amount.toLocaleString()}</span>
                )}
              </p>
            </div>

            {/* RIGHT AREA (button) */}
            <button
              onClick={() => onDelete(s.id)}
              className={`ml-4 px-3 py-1 rounded-md font-medium transition ${archivedMode
                  ? "text-blue-700 hover:text-blue-900"     /* Restore button */
                  : "text-red-600 hover:text-red-800"       /* Archive button */
                }`}
            >
              {archivedMode ? "Restore" : "Archive"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
