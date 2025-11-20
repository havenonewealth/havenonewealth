"use client"

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CSVLink } from "react-csv"

import type { IncomeSource, Payout, MonthlyTrend } from "@/lib/types"

// UI components
import KPI from "@/components/analytics/KPI"
import MonthlyTrendsChart from "@/components/analytics/MonthlyTrendsChart"
import SourceInsightsTable from "@/components/analytics/SourceInsightsTable"

import SourceList from "@/components/sources/SourceList"
import ArchivedList from "@/components/sources/ArchivedList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"

// Supabase functions
import {
  getActiveSources,
  getArchivedSources,
  archiveSource,
  unarchiveSource
} from "@/lib/supabase/sources"


export default function DashboardPage() {
  const router = useRouter()
  const { activeTab } = useTabs()
  const { toast } = useToast()

  const [sources, setSources] = useState<IncomeSource[]>([])
  const [archivedSources, setArchivedSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<any>(null)

  // SlideOver
  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // Archive confirmation
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null)

  // Unarchive confirmation
  const [confirmUnarchiveOpen, setConfirmUnarchiveOpen] = useState(false)
  const [pendingUnarchiveId, setPendingUnarchiveId] = useState<string | null>(null)


  // ---------------------------------------------------------------------
  // Load all dashboard data
  // ---------------------------------------------------------------------
  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) return router.push("/login")

      setUser(loggedIn)
      const userId = loggedIn.id

      // Sources
      setSources(await getActiveSources(userId))
      setArchivedSources(await getArchivedSources(userId))

      // Payouts
      const { data: pay } = await supabase
        .from("payouts")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false })

      setPayouts(pay ?? [])

      // Monthly trends (analytics)
      const { data: trends } = await supabase
        .from("v_user_monthly_trends")
        .select("*")
        .eq("user_id", userId)
        .order("month")

      setMonthlyTrends(trends ?? [])

      // Insights
      const { data: insightRows } = await supabase
        .from("v_user_insights")
        .select("*")
        .eq("user_id", userId)

      setInsights(insightRows ?? [])

      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <div>Loading...</div>


  // ---------------------------------------------------------------------
  // Archive logic
  // ---------------------------------------------------------------------
  async function confirmArchive() {
    if (!pendingArchiveId) return

    await archiveSource(pendingArchiveId)

    // Refresh lists
    const active = await getActiveSources(user.id)
    const archived = await getArchivedSources(user.id)

    setSources(active)
    setArchivedSources(archived)

    toast({ title: "Archived", description: "Source has been archived." })
    setConfirmOpen(false)
    setPendingArchiveId(null)
  }


  // ---------------------------------------------------------------------
  // Unarchive logic
  // ---------------------------------------------------------------------
  async function confirmUnarchive() {
    if (!pendingUnarchiveId) return

    await unarchiveSource(pendingUnarchiveId)

    const active = await getActiveSources(user.id)
    const archived = await getArchivedSources(user.id)

    setSources(active)
    setArchivedSources(archived)

    toast({ title: "Restored", description: "Source is active again." })
    setConfirmUnarchiveOpen(false)
    setPendingUnarchiveId(null)
  }


  // ---------------------------------------------------------------------
  // CSV export for payouts
  // ---------------------------------------------------------------------
  const csvData = payouts.map((p) => ({
    Source: sources.find((s) => s.id === p.source_id)?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))



  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------
  return (
    <div className="mt-6">

      {/* Confirm Archive */}
      <ConfirmDialog
        open={confirmOpen}
        title="Archive Source"
        description="Are you sure you want to archive this source?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={confirmArchive}
      />

      {/* Confirm Unarchive */}
      <ConfirmDialog
        open={confirmUnarchiveOpen}
        title="Unarchive Source"
        description="Restore this source?"
        onCancel={() => setConfirmUnarchiveOpen(false)}
        onConfirm={confirmUnarchive}
      />

      {/* Slide-over editor */}
      <SourceSlideOver
        initial={editingSource}
        userId={user?.id ?? ""}
        open={slideOverOpen}
        onClose={() => {
          setSlideOverOpen(false)
          setEditingSource(null)
        }}
        onSaved={async () => {
          setSources(await getActiveSources(user.id))
          setArchivedSources(await getArchivedSources(user.id))
        }}
      />


      {/* ACTIVE SOURCES */}
      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          onAdd={() => { setEditingSource(null); setSlideOverOpen(true) }}
          onEdit={(s) => { setEditingSource(s); setSlideOverOpen(true) }}
          onArchive={(id) => {
            setPendingArchiveId(id)
            setConfirmOpen(true)
          }}
        />
      )}

      {/* ARCHIVED SOURCES */}
      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(id) => {
            setPendingUnarchiveId(id)
            setConfirmUnarchiveOpen(true)
          }}
        />
      )}

      {/* PAYOUTS */}
      {activeTab === "payouts" && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-[#0A1E2D]">
            Payouts
          </h2>

          <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-md bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Source</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Amount</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Date</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-700">Status</th>
                </tr>
              </thead>

              <tbody>
                {payouts.map((p) => {
                  const src = sources.find((s) => s.id === p.source_id)

                  return (
                    <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                      <td className="py-3 px-4">{src?.source_name || "—"}</td>
                      <td className="py-3 px-4 font-medium text-[#0A1E2D]">
                        ${p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={
                            p.status === "Paid"
                              ? "text-green-700 font-semibold"
                              : p.status === "Pending"
                                ? "text-red-600 font-semibold"
                                : "text-yellow-700 font-semibold"
                          }
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <CSVLink
            data={csvData}
            filename="HavenOne_Payouts.csv"
            className="mt-4 inline-block bg-[#C6A664] px-4 py-2 rounded-md text-[#0A1E2D] font-medium shadow-sm hover:bg-[#b79b56]"
          >
            Export CSV
          </CSVLink>
        </section>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <section>
          <KPI insights={insights} />

          {monthlyTrends.length === 0 ? (
            <p className="text-gray-500">No data available.</p>
          ) : (
            <MonthlyTrendsChart data={monthlyTrends} />
          )}

          <SourceInsightsTable insights={insights} />
        </section>
      )}
    </div>
  )
}
