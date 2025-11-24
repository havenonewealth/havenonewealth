"use client";

import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";

export default function ArchivedList({ archived, userId }: any) {
    const [items, setItems] = useState(archived);

    const refresh = async () => {
        const { data } = await supabase
            .from("income_sources")
            .select("*")
            .eq("user_id", userId)
            .eq("archived", true)
            .order("archived_at", { ascending: false });

        setItems(data || []);
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
                    className="border rounded p-4 bg-gray-50 shadow-inner space-y-1"
                >
                    <div className="font-medium">{row.source_name}</div>
                    <div className="text-sm text-gray-500">{row.source_type}</div>
                    <div className="text-sm text-gray-500">Archived</div>
                </div>
            ))}
        </div>
    );
}
