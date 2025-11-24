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
  const { activeTab } = useTabs();

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
  // Load ALL data including payouts
  // -------------------------------------------
  const loadAll = async (uid: string) => {
    const [{ data: src }, { data: arc }, { data: ins }] = await Promise.all([
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

      supabase.from("admin_insights").select("*")
    ]);

    setSources(src || []);
    setArchived(arc || []);
    setInsights(ins || []);

    // ---------------------------------------------
    // FIXED: load payouts with JOIN to income_sources
    // ---------------------------------------------
    const { data: payoutRows } = await supabase
      .from("payouts")
      .select(
        `
        id,
        amount,
        payment_date,
        status,
        user_id,
        source_id,
        income_sources (
            source_name
        )
      `
      )
      .eq("user_id", uid)
      .order("payment_date", { ascending: false });

    if (payoutRows) {
      const mapped: RecentPayout[] = payoutRows.map((p: any) => ({
        source_name: p.income_sources?.source_name || "Unknown",
        amount: p.amount,
        status: p.status,
        payout_date: p.payment_date, // normalize name
      }));

      setPayouts(mapped);
    }
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
  // RENDER BY TAB
  // -----------------------------------------------------
  return (
    <div className="space-y-6">

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

      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          userId={userId || ""}
          onEdit={handleEdit}
          refreshAll={refreshAll}
        />
      )}

      {activeTab === "archived" && (
        <ArchivedList
          archived={archived}
          userId={userId || ""}
          refreshAll={refreshAll}
        />
      )}

      {activeTab === "payouts" && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Recent Payouts</h2>

          {payouts.length === 0 ? (
            <p className="text-gray-500 text-sm">No payouts found.</p>
          ) : (
            payouts.map((p, idx) => (
              <div
                key={idx}
                className="border rounded p-4 bg-white shadow-sm space-y-1"
              >
                <div className="font-medium">${p.amount}</div>

                <div className="text-sm text-gray-500">
                  {new Date(p.payout_date).toLocaleDateString()}
                </div>

                <div className="text-sm text-gray-500">{p.source_name}</div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "analytics" && <KPI insights={insights} />}

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
