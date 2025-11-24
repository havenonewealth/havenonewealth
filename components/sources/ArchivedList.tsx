"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { IncomeSource } from "@/lib/types";

interface Props {
    archived: IncomeSource[];
    userId: string;
    refreshAll: () => void;
}

export default function ArchivedList({ archived, userId, refreshAll }: Props) {
    const [items, setItems] = useState<IncomeSource[]>([]);

    // Keep internal state updated with parent props
    useEffect(() => {
        setItems(archived);
    }, [archived]);

    // Unarchive a record
    const handleUnarchive = async (id: string) => {
        await supabase
            .from("income_sources")
            .update({
                archived: false,
                archived_at: null
            })
            .eq("id", id);

        refreshAll();
    };

    // Permanently delete (soft delete pattern)
    const handleDelete = async (id: string) => {
        const confirmed = window.confirm(
            "Are you sure you want to permanently delete this source?"
        );
        if (!confirmed) return;

        await supabase
            .from("income_sources")
            .update({
                deleted: true,
                deleted_at: new Date().toISOString(),
                ready_for_delete: true
            })
            .eq("id", id);

        refreshAll();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Archived Sources</h2>

            {items.length === 0 && (
                <p className="text-gray-500 text-sm">No archived sources found.</p>
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
                            Frequency: {row.frequency}
                        </div>
                        <div className="text-sm text-gray-500">
                            Expected: $
                            {row.expected_amount != null
                                ? row.expected_amount.toLocaleString("en-US")
                                : "0"}
                        </div>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => handleUnarchive(row.id!)}
                            className="text-green-600 hover:underline"
                        >
                            Unarchive
                        </button>

                        <button
                            onClick={() => handleDelete(row.id!)}
                            className="text-red-600 hover:underline"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
