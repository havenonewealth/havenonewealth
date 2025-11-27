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

import PayoutEditSlideOver from "@/components/payouts/PayoutEditSlideOver";

// Charts
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from "chart.js";

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement);

export default function DashboardPage() {
  const supabase = createClient();
  const { activeTab } = useTabs();

  // Sources
  const [sources, setSources] = useState<IncomeSource[]>([]);
  const [archived, setArchived] = useState<IncomeSource[]>([]);
  const [trashed, setTrashed] = useState<IncomeSource[]>([]);

  // Analytics
  const [insights, setInsights] = useState<any[]>([]);

  // Payouts
  const [payouts, setPayouts] = useState<RecentPayout[]>([]);

  // Auth + UI state
  const [userId, setUserId] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Source editing
  const [editing, setEditing] = useState<IncomeSource | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);

  // Payout editing
  const [selectedPayout, setSelectedPayout] = useState<RecentPayout | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // -------------------------------------------------------------
  // INITIAL LOAD (session)
  // -------------------------------------------------------------
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

  // Reload if userId is injected later
  useEffect(() => {
    if (userId) loadAll(userId);
  }, [userId]);

  // -------------------------------------------------------------
  // LOAD ALL SOURCES + PAYOUTS
  // -------------------------------------------------------------
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

      // FIXED: No encoding, no broken query
      supabase
        .from("payouts")
        .select(
          `
          id,
          user_id,
          source_id,
          amount,
          status,
          payment_date,
          notes,
          income_sources ( source_name )
        `
        )
        .eq("user_id", uid)
        .order("payment_date", { ascending: false }),
    ]);

    const payoutsClean: RecentPayout[] =
      pays?.map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        source_id: p.source_id,
        amount: Number(p.amount),
        status: p.status,
        payout_date: p.payment_date,
        source_name: p.income_sources?.source_name ?? "",
        notes: p.notes ?? null,
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

  const handleEditSource = (row: IncomeSource) => {
    setEditing(row);
    setSlideOpen(true);
  };

  // -------------------------------------------------------------
  // PAYOUT FILTERING + SORTING
  // -------------------------------------------------------------
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");
  const [search, setSearch] = useState("");

  const uniqueSources = useMemo(() => {
    const names = payouts.map((p) => p.source_name).filter(Boolean);
    return Array.from(new Set(names));
  }, [payouts]);

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 15;

  const filteredPayouts = useMemo(() => {
    let temp = [...payouts];

    if (statusFilter !== "all") {
      temp = temp.filter((p) => p.status === statusFilter);
    }

    if (sourceFilter !== "all") {
      temp = temp.filter((p) => p.source_name === sourceFilter);
    }

    if (search.trim().length > 0) {
      const term = search.toLowerCase();
      temp = temp.filter(
        (p) =>
          p.source_name.toLowerCase().includes(term) ||
          p.amount.toString().includes(term)
      );
    }

    // Sort
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
  }, [payouts, statusFilter, sourceFilter, sortBy, search]);

  const paginated = filteredPayouts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(filteredPayouts.length / pageSize);

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

  const monthlySpark = useMemo(() => {
    const map = new Map<string, number>();
    payouts.forEach((p) => {
      const d = new Date(p.payout_date);
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      map.set(key, (map.get(key) || 0) + p.amount);
    });

    const sorted = [...map.entries()].sort();

    return {
      labels: sorted.map((x) => x[0]),
      datasets: [
        {
          data: sorted.map((x) => x[1]),
          borderColor: "#000",
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    };
  }, [payouts]);

  if (!role) return <div>Loading...</div>;

  // -------------------------------------------------------------
  // UI RENDER
  // -------------------------------------------------------------
  return (
    <div className="space-y-6">
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
            onEdit={handleEditSource}
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
        <div className="space-y-8">
          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="shadow-sm border p-4 rounded bg-white">
              <div className="text-sm text-gray-600">Total payouts</div>
              <div className="text-xl font-semibold">
                {payouts.length.toLocaleString()}
              </div>
            </div>

            <div className="shadow-sm border p-4 rounded bg-white">
              <div className="text-sm text-gray-600">Total this month</div>
              <div className="text-xl font-semibold">
                ${totalThisMonth.toLocaleString()}
              </div>
            </div>

            <div className="shadow-sm border p-4 rounded bg-white">
              <div className="text-sm text-gray-600">Total earned</div>
              <div className="text-xl font-semibold">
                $
                {payouts
                  .reduce((a, b) => a + b.amount, 0)
                  .toLocaleString()}
              </div>
            </div>

            <div className="shadow-sm border p-4 rounded bg-white">
              <div className="text-sm text-gray-600">Earnings trend</div>
              <Line
                data={monthlySpark}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { x: { display: false }, y: { display: false } },
                }}
              />
            </div>
          </div>

          {/* FILTERS */}
          <div className="flex flex-wrap gap-3 items-center">
            <input
              type="text"
              placeholder="Search payouts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-48"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="all">Status: All</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Scheduled">Scheduled</option>
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

          {/* PAYOUTS TABLE */}
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Amount
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Date
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Source
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-left p-3 font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {paginated.map((p, idx) => (
                  <tr
                    key={p.id}
                    className={`border-b ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                      }`}
                  >
                    <td className="p-3 font-medium">
                      ${p.amount.toLocaleString("en-US")}
                    </td>

                    <td className="p-3">
                      {new Date(p.payout_date).toLocaleDateString()}
                    </td>

                    <td className="p-3">{p.source_name}</td>

                    <td className="p-3">
                      <span
                        className={`px-2 py-1 text-xs rounded font-semibold ${p.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : p.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : p.status === "Scheduled"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-red-100 text-red-700"
                          }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() => {
                          setSelectedPayout(p);
                          setEditOpen(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {paginated.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No payouts match your filters.
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <button
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && <KPI insights={insights} />}

      {/* SOURCE SLIDEOVER */}
      <SourceSlideOver
        open={slideOpen}
        setOpen={setSlideOpen}
        editing={editing}
        refresh={refreshAll}
        userId={userId}
      />

      {/* PAYOUT EDIT SLIDEOVER */}
      <PayoutEditSlideOver
        open={editOpen}
        setOpen={setEditOpen}
        payout={selectedPayout}
        sources={sources
          .filter((s) => s.id)
          .map((s) => ({
            id: s.id as string,
            source_name: s.source_name,
          }))}
        refreshAll={refreshAll}
      />
    </div>
  );
}
