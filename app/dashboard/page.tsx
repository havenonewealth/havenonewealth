"use client"

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import type { IncomeSource } from "@/lib/types"
import { CSVLink } from "react-csv"

import KPI from "@/components/analytics/KPI"
import MonthlyTrendsChart from "@/components/analytics/MonthlyTrendsChart"
import SourceInsightsTable from "@/components/analytics/SourceInsightsTable"

import SourceList from "@/components/sources/SourceList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const router = useRouter()
  const { activeTab } = useTabs()
  const { toast } = useToast()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const [sources, setSources] = useState<IncomeSource[]>([])
  const [archivedSources, setArchivedSources] = useState<IncomeSource[]>([])

  const [payouts, setPayouts] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // NEW — Archived toggle
  const [showArchived, setShowArchived] = useState(false)

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const formatCurrency = (v: number | undefined) =>
    v ? v.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00"

  // Load all dashboard data
  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) return router.push("/login")
      setUser(loggedIn)

      const userId = loggedIn.id

      // Load sources
      const { data: activeSrc } = await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("archived", false)

      const { data: archivedSrc } = await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("archived", true)

      // Load payouts
      const { data: pay } = await supabase
        .from("payouts")
        .select("*, income_sources(source_name)")
        .eq("user_id", userId)

      // Load monthly trends
      const { data: trends } = await supabase
        .from("v_user_monthly_trends")
        .select("*")
        .eq("user_id", userId)
        .order("month")

      // Load insights
      const { data: insightRows } = await supabase
        .from("v_user_insights")
        .select("*")
        .eq("user_id", userId)

      setSources(activeSrc ?? [])
      setArchivedSources(archivedSrc ?? [])
      setPayouts(pay ?? [])
      setMonthlyTrends(trends ?? [])
      setInsights(insightRows ?? [])
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  // CSV export
  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status,
  }))

  // -----------------------------
  // ARCHIVE / RESTORE HANDLER
  // -----------------------------
  async function archiveOrRestore(id: string, restore = false) {
    const { error } = await supabase
      .from("income_sources")
      .update({ archived: restore ? false : true })
      .eq("id", id)

    if (error) {
      toast({ title: "Error", description: error.message })
      return
    }

    // Refresh
    const { data: active } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", false)

    const { data: archived } = await supabase
      .from("income_sources")
      .select("*")
      .eq("user_id", user.id)
      .eq("archived", true)

    setSources(active ?? [])
    setArchivedSources(archived ?? [])

    toast({
      title: restore ? "Source Restored" : "Source Archived",
      description: restore
        ? "This item has been moved back to Active."
        : "This item is now in Archived.",
    })
  }

  // -----------------------------
  // CONFIRM DELETE EVENT
  // -----------------------------
  function handleDelete(id: string) {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  return (
    <div className="mt-6">

      {/* CONFIRM DIALOG */}
      <ConfirmDialog
        open={confirmOpen}
        title="Archive Source?"
        description="You can restore it anytime from the Archived tab."
        onCancel={() => {
          setConfirmOpen(false)
          setPendingDeleteId(null)
        }}
        onConfirm={() => {
          if (pendingDeleteId) archiveOrRestore(pendingDeleteId, false)
          setConfirmOpen(false)
          setPendingDeleteId(null)
        }}
      />

      {/* SOURCES TAB */}
      {activeTab === "sources" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Income Sources</h2>

          {/* Toggle */}
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setShowArchived(false)}
              className={`px-4 py-2 rounded-md ${!showArchived
                ? "bg-[#0A1E2D] text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              Active
            </button>

            <button
              onClick={() => setShowArchived(true)}
              className={`px-4 py-2 rounded-md ${showArchived
                ? "bg-[#0A1E2D] text-white"
                : "bg-gray-200 text-gray-600"
                }`}
            >
              Archived
            </button>
          </div>

          {/* SlideOver */}
          {!showArchived && (
            <SourceSlideOver
              initial={editingSource}
              userId={user?.id ?? ""}
              open={slideOverOpen}
              onClose={() => {
                setSlideOverOpen(false)
                setEditingSource(null)
              }}
              onSaved={async () => {
                const { data: active } = await supabase
                  .from("income_sources")
                  .select("*")
                  .eq("user_id", user?.id)
                  .eq("archived", false)

                setSources(active ?? [])
              }}
            />
          )}

          {/* LIST */}
          <SourceList
            sources={showArchived ? archivedSources : sources}
            archivedMode={showArchived}
            onAdd={
              showArchived
                ? undefined
                : () => {
                  setEditingSource(null)
                  setSlideOverOpen(true)
                }
            }
            onEdit={
              showArchived
                ? undefined
                : (src) => {
                  setEditingSource(src)
                  setSlideOverOpen(true)
                }
            }
            onDelete={(id) => {
              if (showArchived) {
                archiveOrRestore(id, true)
              } else {
                handleDelete(id)
              }
            }}
          />
        </section>
      )}

      {/* PAYOUTS TAB */}
      {activeTab === "payouts" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Payouts</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Source</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.income_sources?.source_name || "—"}</td>
                    <td className="p-3">{formatCurrency(p.amount)}</td>
                    <td className="p-3">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <CSVLink
                data={csvData}
                filename={`HavenOne_Payouts_${new Date()
                  .toISOString()
                  .slice(0, 10)}.csv`}
                className="bg-[#C6A664] px-4 py-2 rounded-md text-[#0A1E2D] font-semibold"
              >
                Export CSV
              </CSVLink>
            </div>
          </div>
        </section>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>

          <KPI insights={insights} />

          {monthlyTrends.length === 0 ? (
            <p className="text-gray-500">No monthly trend data available.</p>
          ) : (
            <MonthlyTrendsChart data={monthlyTrends} />
          )}

          <SourceInsightsTable insights={insights} />
        </section>
      )}
    </div>
  )
}
