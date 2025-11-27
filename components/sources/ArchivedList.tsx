"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { IncomeSource } from "@/lib/types";

interface Props {
    archived: IncomeSource[];
    refreshAll: () => void;
}

export default function ArchivedList({ archived, refreshAll }: Props) {
    const supabase = createClient();
    const [items, setItems] = useState<IncomeSource[]>([]);

    useEffect(() => {
        setItems(archived);
    }, [archived]);

    const handleUnarchive = async (id: string) => {
        await supabase
            .from("income_sources")
            .update({ archived: false, archived_at: null })
            .eq("id", id);
        refreshAll();
    };

    const handleMoveToTrash = async (id: string) => {
        const ok = window.confirm("Move this item to Trash?");
        if (!ok) return;

        await supabase
            .from("income_sources")
            .update({
                deleted: true,
                deleted_at: new Date().toISOString(),
                archived: false,
                archived_at: null
            })
            .eq("id", id);

        refreshAll();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Archived Sources</h2>

            {items.length === 0 && (
                <p className="text-gray-500 text-sm">No archived sources.</p>
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
                            ${row.expected_amount?.toLocaleString()}
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleUnarchive(row.id!)}
                            className="text-green-600 hover:underline"
                        >
                            Unarchive
                        </button>

                        <button
                            onClick={() => handleMoveToTrash(row.id!)}
                            className="text-red-600 hover:underline"
                        >
                            Move to Trash
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
