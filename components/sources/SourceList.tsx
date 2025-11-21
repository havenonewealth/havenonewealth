"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd: () => void
  onEdit: (s: IncomeSource) => void
  onArchive: (s: IncomeSource) => void
}

export default function SourceList({ sources, onAdd, onEdit, onArchive }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#0A1E2D]">
          Income Sources
        </h2>

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664] transition"
        >
          Add Source
        </button>
      </div>

      {/* List */}
      <ul className="space-y-3">
        {sources.map((s) => (
          <li
            key={s.id}
            className="p-4 border rounded-lg shadow-sm bg-white"
          >
            <div className="flex justify-between items-center">

              {/* Left side – Click to edit */}
              <div
                onClick={() => onEdit(s)}
                className="cursor-pointer"
              >
                <p className="text-lg font-semibold text-[#0A1E2D]">
                  {s.source_name}
                </p>

                <p className="text-sm text-gray-600">
                  {s.source_type || "Unknown Type"}
                </p>
              </div>

              {/* Right side – Archive button */}
              <button
                onClick={() => onArchive(s)}
                className="px-4 py-2 rounded-md bg-[#0A1E2D] text-white hover:bg-[#C6A664] transition font-medium shadow-sm ml-4"
              >
                Archive
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
