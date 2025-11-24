"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
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
  refreshAll
}: Props) {
  const [items, setItems] = useState<IncomeSource[]>(sources);

  // Sync with parent when switching views
  if (items !== sources) {
    setItems(sources);
  }

  // -----------------------------
  // ARCHIVE
  // -----------------------------
  const handleArchive = async (row: IncomeSource) => {
    await supabase
      .from("income_sources")
      .update({
        archived: true,
        archived_at: new Date().toISOString()
      })
      .eq("id", row.id);

    refreshAll();
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Active Sources</h2>

      {items.length === 0 && (
        <div className="text-gray-400 text-sm">No active sources found.</div>
      )}

      {items.map((row) => (
        <div
          key={row.id}
          className="border rounded p-4 bg-white shadow-sm space-y-1"
        >
          <div className="font-medium">{row.source_name}</div>

          {row.source_type && (
            <div className="text-sm text-gray-500">{row.source_type}</div>
          )}

          <div className="text-sm text-gray-500">
            Frequency: {row.frequency}
          </div>

          {/* Expected Monthly */}
          {row.expected_monthly != null && (
            <div className="text-sm text-gray-500">
              Monthly: $
              {row.expected_monthly.toLocaleString("en-US", {
                minimumFractionDigits: 2
              })}
            </div>
          )}

          <div className="flex space-x-3 pt-2">
            <button
              onClick={() => onEdit(row)}
              className="px-3 py-1 text-xs border rounded bg-blue-100"
            >
              Edit
            </button>

            <button
              onClick={() => handleArchive(row)}
              className="px-3 py-1 text-xs border rounded bg-yellow-100"
            >
              Archive
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
