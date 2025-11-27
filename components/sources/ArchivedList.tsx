"use client";

import { createClient } from "@/lib/supabaseClient";
import type { IncomeSource } from "@/lib/types";

interface Props {
    archived: IncomeSource[];
    refreshAll: () => void;
}

export default function ArchivedList({ archived, refreshAll }: Props) {
    const supabase = createClient();

    const handleRestore = async (id: string) => {
        await supabase
            .from("income_sources")
            .update({
                archived: false,
                archived_at: null
            })
            .eq("id", id);

        refreshAll();
    };

    const handleMoveToTrash = async (id: string) => {
        await supabase
            .from("income_sources")
            .update({
                deleted: true,
                deleted_at: new Date().toISOString()
            })
            .eq("id", id);

        refreshAll();
    };

    return (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold">Archived Sources</h2>

            {archived.length === 0 && (
                <p className="text-gray-500 text-sm">No archived sources.</p>
            )}

            {archived.map((row) => (
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

                        <div className="text-sm text-gray-500">
                            Archived:{" "}
                            {row.archived_at
                                ? new Date(row.archived_at).toLocaleDateString()
                                : "Unknown"}
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => handleRestore(row.id!)}
                            className="text-green-600 hover:underline"
                        >
                            Restore
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
