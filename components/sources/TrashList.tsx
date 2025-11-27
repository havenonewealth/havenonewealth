"use client";

import { useEffect, useState } from "react";
import type { IncomeSource } from "@/lib/types";

interface Props {
    trashed: IncomeSource[];
    userId: string;
    refreshAll: () => void;
}

export default function TrashList({ trashed, userId, refreshAll }: Props) {
    const [items, setItems] = useState<IncomeSource[]>([]);

    useEffect(() => {
        setItems(trashed);
    }, [trashed]);

    const handleRestore = async (id: string) => {
        await fetch("/api/sources/restore", {
            method: "POST",
            body: JSON.stringify({ id }),
        });

        refreshAll();
    };

    const handlePermanentDelete = async (id: string) => {
        const ok = window.confirm(
            "This will permanently remove the source and all related payouts. Continue?"
        );
        if (!ok) return;

        await fetch("/api/sources/delete", {
            method: "POST",
            body: JSON.stringify({ id }),
        });

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
                        <div className="text-sm text-gray-500">
                            {row.source_type || ""}
                        </div>
                        <div className="text-sm text-gray-500">
                            Archived At:{" "}
                            {row.archived_at
                                ? new Date(row.archived_at).toLocaleDateString()
                                : ""}
                        </div>
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
