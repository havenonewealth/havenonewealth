"use client"

import React from "react"
import { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd: () => void
  onEdit: (s: IncomeSource) => void
  onArchive: (id: string) => void
}

export default function SourceList({ sources, onAdd, onEdit, onArchive }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Income Sources</h2>

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#0A1E2D] text-white rounded-md"
        >
          Add Source
        </button>
      </div>

      <ul className="space-y-3">
        {sources.map((s) => (
          <li key={s.id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div onClick={() => onEdit(s)} className="cursor-pointer flex-1">
                <p className="text-lg font-semibold">{s.source_name}</p>
              </div>

              <button
                onClick={() => onArchive(s.id)}
                className="text-red-600 hover:text-red-800 ml-4"
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
