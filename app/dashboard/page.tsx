"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabaseClient";
import { useTabs } from "./TabContext";

import SourceList from "@/components/sources/SourceList";
import ArchivedList from "@/components/sources/ArchivedList";
import TrashList from "@/components/sources/TrashList";
import SourceSlideOver from "@/components/sources/SourceSlideOver";
import KPI from "@/components/analytics/KPI";

import type { IncomeSource, RecentPayout } from "@/lib/types";

export default function DashboardPage() {
  const supabase = createClient();
  const { activeTab } = useTabs();

  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [archived, setArchived] = useState<IncomeSource[]>([]);
  const [trashed, setTrashed] = useState<IncomeSource[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<RecentPayout[]>([]);

  const [userId, setUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // --------------------------
  // Load session → role → data
  // --------------------------
  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession();
      const uid = sessionData?.session?.user?.id || null;
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

  useEffect(() => {
    if (userId) loadAll(userId);
  }, [userId]);

  // --------------------------
  // Load everything
  // --------------------------
  const loadAll = async (uid: string) => {
    const [
      { data: src },
      { data: arc },
      { data: del },
      { data: ins },
      { data: pays },
    ] = await Promise.all([
      supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", uid)
        .eq("archived", false)
        .eq("deleted", false)
        .order("created_at", { ascending: false }),

      supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", uid)
        .eq("archived", true)
        .eq("deleted", false)
        .order("archived_at", { ascending: false }),

      supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", uid)
        .eq("deleted", true)
        .order("deleted_at", { ascending: false }),

      supabase.from("v_user_insights").select("*").eq("user_id", uid),

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
        .order("payment_date", { ascending: false }),
    ]);

    const payoutsClean: RecentPayout[] =
      pays?.map((p: any) => ({
        id: p.id,
        amount: Number(p.amount),
        status: p.status,
        payout_date: p.payment_date,
        source_name: p.income_sources?.source_name ?? "",
      })) || [];

    setSources(src || []);
    setArchived(arc || []);
    setTrashed(del || []);
    setInsights(ins || []);
    setPayouts(payoutsClean);
  };

  const refreshAll = () => userId && loadAll(userId);

  const handleAdd = () => {
    setEditing(null);
    setSlideOpen(true);
  };

  const handleEdit = (row: IncomeSource) => {
    setEditing(row);
    setSlideOpen(true);
  };

  // ============================================================
  // Payouts Filters + Sorting
  // ============================================================

  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const uniqueSources = useMemo(() => {
    const names = payouts.map((p) => p.source_name).filter(Boolean);
    return Array.from(new Set(names));
  }, [payouts]);

  const filteredPayouts = useMemo(() => {
    let temp = [...payouts];

    if (statusFilter !== "all") {
      temp = temp.filter((p) => p.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      temp = temp.filter((p) => p.source_name === sourceFilter);
    }

    if (sortBy === "date-desc") {
      temp.sort(
        (a, b) =>
          new Date(b.payout_date).getTime() -
          new Date(a.payout_date).getTime()
      );
    } else if (sortBy === "date-asc") {
      temp.sort(
        (a, b) =>
          new Date(a.payout_date).getTime() -
          new Date(b.payout_date).getTime()
      );
    } else if (sortBy === "amount-desc") {
      temp.sort((a, b) => b.amount - a.amount);
    } else if (sortBy === "amount-asc") {
      temp.sort((a, b) => a.amount - b.amount);
    }

    return temp;
  }, [payouts, statusFilter, sourceFilter, sortBy]);

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return payouts
      .filter((p) => {
        const d = new Date(p.payout_date);
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      })
      .reduce((sum, p) => sum + p.amount, 0);
  }, [payouts]);

  // ============================================================
  // Render
  // ============================================================

  if (!role) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">

      {/* SOURCES TAB */}
      {activeTab === "sources" && (
        <>
          <div className="flex justify-end">
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-black text-white rounded"
            >
              Add Source
            </button>
          </div>

          <SourceList
            sources={sources}
            userId={userId || ""}
            onEdit={handleEdit}
            refreshAll={refreshAll}
          />
        </>
      )}

      {/* ARCHIVED TAB */}
      {activeTab === "archived" && (
        <ArchivedList archived={archived} refreshAll={refreshAll} />
      )}

      {/* TRASH TAB */}
      {activeTab === "trash" && (
        <TrashList trashed={trashed} refreshAll={refreshAll} />
      )}

      {/* PAYOUTS TAB */}
      {activeTab === "payouts" && (
        <div className="space-y-6">

          {/* KPI ROW */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white shadow-sm border rounded">
              <div className="text-sm text-gray-500">Total payouts</div>
              <div className="text-2xl font-semibold">{payouts.length}</div>
            </div>
            <div className="p-4 bg-white shadow-sm border rounded">
              <div className="text-sm text-gray-500">Total this month</div>
              <div className="text-2xl font-semibold">
                ${totalThisMonth.toLocaleString()}
              </div>
            </div>
            <div className="p-4 bg-white shadow-sm border rounded">
              <div className="text-sm text-gray-500">Total earned</div>
              <div className="text-2xl font-semibold">
                $
                {payouts
                  .reduce((a, b) => a + b.amount, 0)
                  .toLocaleString()}
              </div>
            </div>
          </div>

          {/* FILTER BAR */}
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Source: All</option>
              {uniqueSources.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="date-desc">Sort: Date (Newest)</option>
              <option value="date-asc">Sort: Date (Oldest)</option>
              <option value="amount-desc">Sort: Amount (High)</option>
              <option value="amount-asc">Sort: Amount (Low)</option>
            </select>
          </div>

          {/* PAYOUT TABLE */}
          <div className="bg-white border rounded shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Source</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayouts.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 font-medium">
                      ${p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(p.payout_date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{p.source_name}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 text-xs rounded ${p.status === "Paid"
                          ? "bg-green-100 text-green-700"
                          : p.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                          }`}
                      >
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPayouts.length === 0 && (
            <p className="text-gray-500 text-sm">No payouts found.</p>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && <KPI insights={insights} />}

      {/* SLIDEOVER (Add/Edit Source) */}
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
