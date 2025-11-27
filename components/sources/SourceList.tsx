"use client";

import { useEffect, useState } from "react";
import type { IncomeSource } from "@/lib/types";

interface Props {
  sources: IncomeSource[];
  userId: string;
  onEdit: (row: IncomeSource) => void;
  refreshAll: () => void;
}

export default function SourceList({
  sources,
  userId,
  onEdit,
  refreshAll,
}: Props) {
  const [items, setItems] = useState<IncomeSource[]>([]);

  useEffect(() => {
    setItems(sources);
  }, [sources]);

  const handleArchive = async (id: string) => {
    await fetch("/api/sources/archive", {
      method: "POST",
      body: JSON.stringify({ id }),
    });

    refreshAll();
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Active Sources</h2>

      {items.length === 0 && (
        <p className="text-gray-500 text-sm">No active sources.</p>
      )}

      {items.map((row) => (
        <div
          key={row.id}
          className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
        >
          <div>
            <div className="font-medium">{row.source_name}</div>
            <div className="text-sm text-gray-500">{row.source_type}</div>
            <div className="text-sm text-gray-500">
              Expected: $
              {row.expected_amount
                ? row.expected_amount.toLocaleString()
                : "0"}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => onEdit(row)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => handleArchive(row.id!)}
              className="text-red-600 hover:underline"
            >
              Archive
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
