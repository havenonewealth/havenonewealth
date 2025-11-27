"use client";

import { createClient } from "@/lib/supabaseClient";
import type { IncomeSource } from "@/lib/types";

interface Props {
  sources: IncomeSource[];
  userId: string;
  onEdit: (row: IncomeSource) => void;
  refreshAll: () => void;
}

export default function SourceList({ sources, onEdit, refreshAll }: Props) {
  const supabase = createClient();

  // Archive
  const handleArchive = async (id: string) => {
    await supabase
      .from("income_sources")
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
      })
      .eq("id", id);

    refreshAll();
  };

  // Move to Trash (soft delete)
  const handleMoveToTrash = async (id: string) => {
    const confirmed = window.confirm(
      "This will move the source to the Trash. Continue?"
    );
    if (!confirmed) return;

    await supabase
      .from("income_sources")
      .update({
        deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", id);

    refreshAll();
  };

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Active Sources</h2>

      {sources.length === 0 && (
        <p className="text-gray-500 text-sm">No active sources.</p>
      )}

      {sources.map((row) => (
        <div
          key={row.id}
          className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
        >
          <div>
            <div className="font-medium">{row.source_name}</div>

            {row.source_type && (
              <div className="text-sm text-gray-500">{row.source_type}</div>
            )}

            <div className="text-sm text-gray-500">
              Frequency: {row.frequency}
            </div>

            <div className="text-sm text-gray-500">
              Expected: $
              {row.expected_amount != null
                ? Number(row.expected_amount).toLocaleString("en-US")
                : "0"}
            </div>
          </div>

          <div className="flex gap-4 text-sm">
            <button
              onClick={() => onEdit(row)}
              className="text-blue-600 hover:underline"
            >
              Edit
            </button>

            <button
              onClick={() => handleArchive(row.id!)}
              className="text-yellow-600 hover:underline"
            >
              Archive
            </button>

            <button
              onClick={() => handleMoveToTrash(row.id!)}
              className="text-red-600 hover:underline"
            >
              Trash
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
