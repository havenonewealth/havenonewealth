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

// Supabase source functions
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

      // Payouts (no joins)
      const { data: pay, error: payErr } = await supabase
        .from("payouts")
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false })

      if (!payErr) setPayouts(pay ?? [])

      // Monthly analytics
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
  // Payout CSV export
  // ---------------------------------------------------------------------
  const csvData = payouts.map((p) => ({
    Source: "—",          // Option B: No join
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))


  // ---------------------------------------------------------------------
  // Render UI
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


      {/* ACTIVE SOURCES TAB */}
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

      {/* ARCHIVED SOURCES TAB */}
      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(id) => {
            setPendingUnarchiveId(id)
            setConfirmUnarchiveOpen(true)
          }}
        />
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
                    <td className="p-3">—</td>
                    <td className="p-3">${p.amount.toLocaleString()}</td>
                    <td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CSVLink
            data={csvData}
            filename="HavenOne_Payouts.csv"
            className="mt-4 inline-block bg-[#C6A664] px-4 py-2 rounded-md text-[#0A1E2D]"
          >
            Export CSV
          </CSVLink>
        </section>
      )}

      {/* ANALYTICS TAB */}
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
