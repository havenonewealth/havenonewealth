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
  const { activeTab } = useTabs(); // GLOBAL TAB

  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [archived, setArchived] = useState<IncomeSource[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<RecentPayout[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);

  const [role, setRole] = useState<string | null>(null);

  // -----------------------------------------
  // Load session → user → role → user data
  // -----------------------------------------
  useEffect(() => {
    async function init() {
      const session = await supabase.auth.getSession();
      const uid = session.data.session?.user?.id || null;
      if (!uid) return;

      setUserId(uid);

      const { data: userRow } = await supabase
        .from("users")
        .select("role")
        .eq("id", uid)
        .single();

      setRole(userRow?.role || "user");

      await loadAll(uid);
    }

    init();
  }, []);

  // -----------------------------------------
  // Reload whenever userId becomes available
  // -----------------------------------------
  useEffect(() => {
    if (userId) loadAll(userId);
  }, [userId]);

  // -----------------------------------------
  // Load all dashboard data
  // -----------------------------------------
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

        supabase
          .from("v_user_insights")
          .select("*")
          .eq("user_id", uid),

        supabase
          .from("payouts")
          .select(
            `
              id,
              amount,
              status,
              payment_date,
              source_id,
              income_sources ( source_name )
            `
          )
          .eq("user_id", uid)
          .order("payment_date", { ascending: false })
      ]);

    const payoutsClean: RecentPayout[] =
      pays?.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        payout_date: p.payment_date,
        source_name: p.income_sources?.[0]?.source_name ?? ""
      })) || [];

    setSources(src || []);
    setArchived(arc || []);
    setInsights(ins || []);
    setPayouts(payoutsClean);
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

  // ==================================================
  // RENDER
  // ==================================================
  if (!role) return <div>Loading...</div>;

  // ADMIN TAB → go to admin dashboard
  if (activeTab === "admin") {
    return (
      <div>
        <h1 className="text-xl font-semibold mb-4">Admin Dashboard</h1>
        <p>Loading admin view...</p>
      </div>
    );
  }

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

          {payouts.length === 0 && (
            <p className="text-gray-500 text-sm">No payouts found.</p>
          )}

          {payouts.map((p) => (
            <div
              key={p.id}
              className="border rounded p-4 bg-white shadow-sm space-y-1"
            >
              <div className="font-medium">
                ${p.amount.toLocaleString("en-US")}
              </div>

              <div className="text-sm text-gray-500">
                {new Date(p.payout_date).toLocaleDateString()}
              </div>

              <div className="text-sm text-gray-500">
                {p.source_name}
              </div>
            </div>
          ))}
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
