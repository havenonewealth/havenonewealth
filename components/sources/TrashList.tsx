"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { IncomeSource } from "@/lib/types";

interface Props {
    trashed: IncomeSource[];
    refreshAll: () => void;
}

export default function TrashList({ trashed, refreshAll }: Props) {
    const supabase = createClient();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleRestore = async (id: string) => {
        await supabase
            .from("income_sources")
            .update({
                deleted: false,
                deleted_at: null
            })
            .eq("id", id);

        refreshAll();
    };

    const handleDeleteForever = async () => {
        if (!deletingId) return;

        await supabase
            .from("income_sources")
            .delete()
            .eq("id", deletingId);

        setDeletingId(null);
        refreshAll();
    };

    return (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold">Trash</h2>

            {trashed.length === 0 && (
                <p className="text-gray-500 text-sm">Trash is empty.</p>
            )}

            {trashed.map((row) => (
                <div
                    key={row.id}
                    className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
                >
                    <div>
                        <div className="font-medium">{row.source_name}</div>
                        <div className="text-sm text-gray-500">{row.source_type}</div>
                        <div className="text-sm text-gray-500">
                            Deleted:{" "}
                            {row.deleted_at
                                ? new Date(row.deleted_at).toLocaleDateString()
                                : "Unknown"}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={() => handleRestore(row.id!)}
                            className="text-green-600 hover:underline"
                        >
                            Restore
                        </button>

                        <button
                            onClick={() => setDeletingId(row.id!)}
                            className="text-red-600 hover:underline"
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>
            ))}

            {deletingId && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white w-80 rounded-lg shadow-lg p-6 space-y-4">
                        <h3 className="text-lg font-semibold">Delete Forever?</h3>

                        <p className="text-sm text-gray-600">
                            This action cannot be undone. The source will be permanently deleted.
                        </p>

                        <div className="flex justify-end gap-3 pt-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="px-4 py-2 border rounded"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleDeleteForever}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                Delete Forever
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
