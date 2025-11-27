"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import type { IncomeSource } from "@/lib/types";

interface Props {
    trashed: IncomeSource[];
    refreshAll: () => void;
}

export default function TrashList({ trashed, refreshAll }: Props) {
    const supabase = createClient();
    const [items, setItems] = useState<IncomeSource[]>([]);

    useEffect(() => {
        setItems(trashed);
    }, [trashed]);

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

    const handlePermanentDelete = async (id: string) => {
        const ok = window.confirm(
            "This will permanently delete this source. Continue?"
        );

        if (!ok) return;

        await supabase.from("income_sources").delete().eq("id", id);

        refreshAll();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold">Trash</h2>

            {items.length === 0 && (
                <p className="text-gray-500 text-sm">Trash is empty.</p>
            )}

            {items.map((row) => (
                <div
                    key={row.id}
                    className="border rounded p-4 bg-white shadow-sm flex justify-between items-center"
                >
                    <div>
                        <div className="font-medium">{row.source_name}</div>
                        <div className="text-sm text-gray-500">{row.source_type}</div>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => handleRestore(row.id!)}
                            className="text-blue-600 hover:underline"
                        >
                            Restore
                        </button>

                        <button
                            onClick={() => handlePermanentDelete(row.id!)}
                            className="text-red-600 hover:underline"
                        >
                            Delete Forever
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
