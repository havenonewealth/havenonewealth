"use client"

import React from "react"
import type { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd: () => void
  onEdit: (source: IncomeSource) => void
}

export default function SourceList({ sources, onAdd, onEdit }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Income Sources</h2>

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664] transition"
        >
          Add Source
        </button>
      </div>

      <ul className="space-y-3">
        {sources.map((s) => (
          <li
            key={s.id}
            onClick={() => onEdit(s)}
            className="p-4 border rounded-lg shadow-sm hover:bg-gray-50 cursor-pointer"
          >
            <p className="text-lg font-semibold">{s.source_name}</p>

            <p className="text-sm text-gray-600">
              {s.source_type && <span>{s.source_type} • </span>}
              {s.frequency && <span>{s.frequency} • </span>}
              {s.expected_amount && (
                <span>${s.expected_amount.toLocaleString()}</span>
              )}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
