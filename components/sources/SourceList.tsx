"use client"

import { IncomeSource } from "@/lib/types"

interface Props {
  sources: IncomeSource[]
  onAdd: () => void
  onEdit: (id: string) => void
  onArchive: (id: string) => void
}

export default function SourceList({ sources, onAdd, onEdit, onArchive }: Props) {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-[#0A1E2D]">Income Sources</h2>

        <button
          onClick={onAdd}
          className="px-4 py-2 bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664]"
        >
          Add Source
        </button>
      </div>

      <ul className="space-y-3">
        {sources.map(s => (
          <li key={s.id} className="p-4 border rounded-lg shadow-sm bg-white">
            <div className="flex justify-between items-center">
              <div className="cursor-pointer" onClick={() => onEdit(s.id)}>
                <p className="text-lg font-semibold">{s.source_name}</p>
                <p className="text-sm text-gray-600">{s.source_type || "Unknown Type"}</p>
              </div>

              <button
                onClick={() => onArchive(s.id)}
                className="px-4 py-2 rounded-md bg-[#0A1E2D] text-white hover:bg-[#C6A664]"
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
