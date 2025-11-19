"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd: () => void
  onEdit: (s: IncomeSource) => void
  onDelete: (id: string) => void
}

export default function SourceList({ sources, onAdd, onEdit, onDelete }: Props) {
  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Income Sources</h2>

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
            className="p-4 border rounded-lg shadow-sm hover:bg-gray-50 transition"
          >
            <div className="flex justify-between items-start">
              {/* Click-to-edit */}
              <div
                onClick={() => onEdit(s)}
                className="cursor-pointer flex-1"
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

              {/* Delete button */}
              <button
                onClick={() => onDelete(s.id)}
                className="ml-4 text-red-600 hover:text-red-800 font-medium"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
