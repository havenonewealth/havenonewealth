"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import type { IncomeSource } from "@/lib/types";

interface Props {
    archived: IncomeSource[];
    userId: string;
    refreshAll: () => void;
}

export default function ArchivedList({
    archived,
    userId,
    refreshAll
}: Props) {
    const [items, setItems] = useState<IncomeSource[]>(archived);

    // Sync with parent data immediately on tab switch
    if (items !== archived) {
        setItems(archived);
    }

    // -----------------------------
    // UNARCHIVE
    // -----------------------------
    const handleUnarchive = async (row: IncomeSource) => {
        await supabase
            .from("income_sources")
            .update({
                archived: false,
                archived_at: null
            })
            .eq("id", row.id);

        refreshAll();
    };

    // -----------------------------
    // PERMANENT DELETE
    // -----------------------------
    const handleDelete = async (row: IncomeSource) => {
        if (!confirm("Permanently delete this source?")) return;

        await supabase
            .from("income_sources")
            .update({
                deleted: true,
                deleted_at: new Date().toISOString(),
                ready_for_delete: true
            })
            .eq("id", row.id);

        refreshAll();
    };

    // -----------------------------
    // UI
    // -----------------------------
    return (
        <div className="space-y-3">
            <h2 className="text-lg font-semibold">Archived Sources</h2>

            {items.length === 0 && (
                <div className="text-gray-400 text-sm">No archived sources found.</div>
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
                            onClick={() => handleUnarchive(row)}
                            className="px-3 py-1 text-xs border rounded bg-green-100"
                        >
                            Unarchive
                        </button>

                        <button
                            onClick={() => handleDelete(row)}
                            className="px-3 py-1 text-xs border rounded bg-red-100"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
