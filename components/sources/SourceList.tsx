"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function SourceList({ sources, userId }: any) {
  const [items, setItems] = useState(sources);

  const refresh = async () => {
    const { data } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", userId)
      .eq("archived", false)
      .order("created_at", { ascending: false });

    setItems(data || []);
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold">Active Sources</h2>

      {items.length === 0 && (
        <div className="text-gray-400 text-sm">
          No active sources found.
        </div>
      )}

      {items.map((row: any) => (
        <div
          key={row.id}
          className="border rounded p-4 bg-white shadow-sm space-y-1"
        >
          <div className="font-medium">{row.source_name}</div>
          <div className="text-sm text-gray-500">{row.source_type}</div>
          <div className="text-sm text-gray-500">Frequency: {row.frequency}</div>
        </div>
      ))}
    </div>
  );
}
