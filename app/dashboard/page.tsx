"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { useTabs } from "./TabContext";

import SourceList from "@/components/sources/SourceList";
import ArchivedList from "@/components/sources/ArchivedList";
import SourceSlideOver from "@/components/sources/SourceSlideOver";
import KPI from "@/components/analytics/KPI";

import type { IncomeSource, RecentPayout } from "@/lib/types";

export default function DashboardPage() {
  const { activeTab } = useTabs(); // ← GLOBAL TAB STATE

  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [archived, setArchived] = useState<IncomeSource[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<RecentPayout[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);

  // -------------------------------------------
  // Initial session load
  // -------------------------------------------
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id || null;
      if (uid) {
        setUserId(uid);
        loadAll(uid);
      }
    });
  }, []);

  // -------------------------------------------
  // Reload whenever user becomes available
  // -------------------------------------------
  useEffect(() => {
    if (userId) loadAll(userId);
  }, [userId]);

  // -------------------------------------------
  // Master loader
  // -------------------------------------------
  const loadAll = async (uid: string) => {
    const [{ data: src }, { data: arc }, { data: ins }, { data: pays }] =
      await Promise.all([
        supabase
          .from("income_sources")
          .select("*")
          .eq("user_id", uid)
          .eq("archived", false)
          .order("created_at", { ascending: false }),

        supabase
          .from("income_sources")
          .select("*")
          .eq("user_id", uid)
          .eq("archived", true)
          .order("created_at", { ascending: false }),

        supabase.from("admin_insights").select("*"),

        supabase.from("admin_recent_payouts").select("*")
      ]);

    setSources(src || []);
    setArchived(arc || []);
    setInsights(ins || []);
    setPayouts((pays as RecentPayout[]) || []);
  };

  const refreshAll = () => {
    if (userId) loadAll(userId);
  };

  const handleAdd = () => {
    setEditing(null);
    setSlideOpen(true);
  };

  const handleEdit = (row: IncomeSource) => {
    setEditing(row);
    setSlideOpen(true);
  };

  // -----------------------------------------------------
  // RENDER BY TAB (from GLOBAL CONTEXT)
  // -----------------------------------------------------
  return (
    <div className="space-y-6">

      {/* Action button only in Sources */}
      {activeTab === "sources" && (
        <div className="flex justify-end">
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-black text-white rounded"
          >
            Add Source
          </button>
        </div>
      )}

      {/* Sources */}
      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          userId={userId || ""}
          onEdit={handleEdit}
          refreshAll={refreshAll}
        />
      )}

      {/* Archived */}
      {activeTab === "archived" && (
        <ArchivedList
          archived={archived}
          userId={userId || ""}
          refreshAll={refreshAll}
        />
      )}

      {/* Payouts */}
      {activeTab === "payouts" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Payouts</h2>

          {payouts.length === 0 && (
            <p className="text-gray-500 text-sm">No payouts found.</p>
          )}

          {payouts.map((p) => (
            <div
              key={`${p.source_name}-${p.payout_date}`}
              className="border rounded p-4 bg-white shadow-sm space-y-1"
            >
              <div className="font-medium">${p.amount}</div>
              <div className="text-sm text-gray-500">
                {new Date(p.payout_date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">{p.source_name}</div>
            </div>
          ))}
        </div>
      )}

      {/* Analytics */}
      {activeTab === "analytics" && <KPI insights={insights} />}

      {/* Slide Over */}
      <SourceSlideOver
        open={slideOpen}
        setOpen={setSlideOpen}
        editing={editing}
        refresh={refreshAll}
        userId={userId}
      />
    </div>
  );
}
