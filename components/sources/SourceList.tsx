"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

interface SourceListProps {
  sources: any[];
  userId: string;
  onEdit: (row: any) => void;
  refreshAll: () => void;
}

export default function SourceList({
  sources,
  userId,
  onEdit,
  refreshAll
}: SourceListProps) {
  const [items, setItems] = useState(sources);

  const refresh = async () => {
    const { data } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", false)
      .order("created_at", { ascending: false });

    setItems(data || []);
    refreshAll();
  };

  const handleArchive = async (id: string) => {
    await supabase
      .from("income_sources")
      .update({ archived: true })
      .eq("id", id);

    refresh();
  };

  const handleDelete = async (id: string) => {
    await supabase
      .from("income_sources")
      .delete()
      .eq("id", id);

    refresh();
  };

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
          <div className="font-medium flex justify-between items-center">
            <span>{row.source_name}</span>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onEdit(row)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-100"
              >
                Edit
              </button>

              <button
                onClick={() => handleArchive(row.id)}
                className="px-3 py-1 text-sm border rounded text-orange-600 hover:bg-orange-50"
              >
                Archive
              </button>

              <button
                onClick={() => handleDelete(row.id)}
                className="px-3 py-1 text-sm border rounded text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>

          <div className="text-sm text-gray-500">{row.source_type}</div>
          <div className="text-sm text-gray-500">
            Frequency: {row.frequency}
          </div>
        </div>
      ))}
    </div>
  );
}
