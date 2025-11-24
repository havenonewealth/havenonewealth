"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

interface ArchivedListProps {
    archived: any[];
    userId: string;
    refreshAll: () => void;
}

export default function ArchivedList({
    archived,
    userId,
    refreshAll
}: ArchivedListProps) {
    const [items, setItems] = useState(archived);

    const refresh = async () => {
        const { data } = await supabase
            .from("income_sources")
            .select("*")
            .eq("user_id", userId)
            .eq("archived", true)
            .order("created_at", { ascending: false });

        setItems(data || []);
        refreshAll();
    };

    const handleUnarchive = async (id: string) => {
        await supabase
            .from("income_sources")
            .update({ archived: false })
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
            <h2 className="text-lg font-semibold">Archived Sources</h2>

            {items.length === 0 && (
                <div className="text-gray-400 text-sm">
                    No archived sources found.
                </div>
            )}

            {items.map((row: any) => (
                <div
                    key={row.id}
                    className="border rounded p-4 bg-white shadow-sm space-y-1"
                >
                    <div className="font-medium flex justify-between items-center">
                        <span>{row.source_name}</span>

                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => handleUnarchive(row.id)}
                                className="px-3 py-1 text-sm border rounded text-blue-600 hover:bg-blue-50"
                            >
                                Unarchive
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
