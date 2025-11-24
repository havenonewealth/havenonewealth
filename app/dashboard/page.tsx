"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import SourceList from "@/components/sources/SourceList";
import ArchivedList from "@/components/sources/ArchivedList";
import SourceSlideOver from "@/components/sources/SourceSlideOver";
import KPI from "@/components/analytics/KPI";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("sources");

  const [sources, setSources] = useState<any[]>([]);
  const [archived, setArchived] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);

  const [userId, setUserId] = useState<string | null>(null);

  const [editing, setEditing] = useState<any | null>(null);
  const [slideOpen, setSlideOpen] = useState(false);

  // -----------------------------
  // Load user on mount
  // -----------------------------
  useEffect(() => {
    if (!userId) return;
    loadAll(userId);
  }, [userId]);

  // FORCE LOAD after session resolves
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user?.id || null;
      if (uid) {
        setUserId(uid);
        loadAll(uid); // <- CRITICAL
      }
    });
  }, []);


  // -----------------------------
  // Load all dashboard data
  // -----------------------------
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

        supabase.from("admin_recent_payouts").select("*"),
      ]);

    setSources(src || []);
    setArchived(arc || []);
    setInsights(ins || []);
    setPayouts(pays || []);
  };

  // -----------------------------
  // Reload when user loads
  // -----------------------------
  useEffect(() => {
    if (userId) loadAll(userId);
  }, [userId]);

  // -----------------------------
  // Refresh callback for child components
  // -----------------------------
  const refreshAll = () => {
    if (userId) loadAll(userId);
  };

  // -----------------------------
  // Begin Create / Edit
  // -----------------------------
  const handleAdd = () => {
    setEditing(null);
    setSlideOpen(true);
  };

  const handleEdit = (row: any) => {
    setEditing(row);
    setSlideOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Tabs */}
      <div className="flex space-x-4 border-b pb-2">
        <button
          onClick={() => setActiveTab("sources")}
          className={`pb-2 ${activeTab === "sources"
            ? "border-b-2 border-black font-semibold"
            : "text-gray-500"
            }`}
        >
          Sources
        </button>

        <button
          onClick={() => setActiveTab("archived")}
          className={`pb-2 ${activeTab === "archived"
            ? "border-b-2 border-black font-semibold"
            : "text-gray-500"
            }`}
        >
          Archived
        </button>

        <button
          onClick={() => setActiveTab("payouts")}
          className={`pb-2 ${activeTab === "payouts"
            ? "border-b-2 border-black font-semibold"
            : "text-gray-500"
            }`}
        >
          Payouts
        </button>

        <button
          onClick={() => setActiveTab("analytics")}
          className={`pb-2 ${activeTab === "analytics"
            ? "border-b-2 border-black font-semibold"
            : "text-gray-500"
            }`}
        >
          Analytics
        </button>
      </div>

      {/* ACTION BUTTON */}
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

      {/* TAB CONTENT */}

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

          {payouts.map((p: any) => (
            <div
              key={p.id}
              className="border rounded p-4 bg-white shadow-sm space-y-1"
            >
              <div className="font-medium">${p.amount}</div>
              <div className="text-sm text-gray-500">
                {new Date(p.date).toLocaleDateString()}
              </div>
              <div className="text-sm text-gray-500">{p.source_name}</div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "analytics" && (
        <div>
          <KPI insights={insights} />
        </div>
      )}

      {/* Slide-Over */}
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
