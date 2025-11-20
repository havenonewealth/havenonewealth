"use client"

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CSVLink } from "react-csv"
import type { IncomeSource } from "@/lib/types"

// UI + components
import KPI from "@/components/analytics/KPI"
import MonthlyTrendsChart from "@/components/analytics/MonthlyTrendsChart"
import SourceInsightsTable from "@/components/analytics/SourceInsightsTable"

import SourceList from "@/components/sources/SourceList"
import ArchivedList from "@/components/sources/ArchivedList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"

import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"

import type { Payout, MonthlyTrend as AnalyticsRow } from "@/lib/types"
import type { MonthlyTrend } from "@/lib/types"

// Supabase functions
import {
  getActiveSources,
  getArchivedSources,
  archiveSource,
  unarchiveSource
} from "@/lib/supabase/sources"

export default function DashboardPage() {
  const router = useRouter()
  const { activeTab, setActiveTab } = useTabs()
  const { toast } = useToast()

  const [sources, setSources] = useState<IncomeSource[]>([])
  const [archivedSources, setArchivedSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])

  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<any>(null)

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // Archive confirmation
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null)

  // Unarchive confirmation
  const [confirmUnarchiveOpen, setConfirmUnarchiveOpen] = useState(false)
  const [pendingUnarchiveId, setPendingUnarchiveId] = useState<string | null>(null)

  // -----------------------------
  // Load all dashboard data
  // -----------------------------
  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) return router.push("/login")

      setUser(loggedIn)
      const userId = loggedIn.id

      setSources(await getActiveSources(userId))
      setArchivedSources(await getArchivedSources(userId))

      const { data: pay } = await supabase
        .from("payouts")
        .select("*, income_sources(source_name)")
        .eq("user_id", userId)

      const { data: trends } = await supabase
        .from("v_user_monthly_trends")
        .select("*")
        .eq("user_id", userId)
        .order("month")

      const { data: insightRows } = await supabase
        .from("v_user_insights")
        .select("*")
        .eq("user_id", userId)

      setPayouts(pay ?? [])
      setMonthlyTrends(trends ?? [])
      setInsights(insightRows ?? [])
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  // -----------------------------
  // Archive logic
  // -----------------------------
  async function confirmArchive() {
    if (!pendingArchiveId || !user) return

    await archiveSource(pendingArchiveId)

    setSources(prev => prev.filter(s => s.id !== pendingArchiveId))

    const refreshed = await getArchivedSources(user.id)
    setArchivedSources(refreshed)

    toast({ title: "Archived", description: "Source has been archived." })
    setConfirmOpen(false)
    setPendingArchiveId(null)
  }

  async function confirmUnarchive() {
    if (!pendingUnarchiveId || !user) return

    await unarchiveSource(pendingUnarchiveId)

    const refreshedActive = await getActiveSources(user.id)
    const refreshedArchived = await getArchivedSources(user.id)

    setSources(refreshedActive)
    setArchivedSources(refreshedArchived)

    toast({ title: "Restored", description: "Source is active again." })
    setConfirmUnarchiveOpen(false)
    setPendingUnarchiveId(null)
  }

  const csvData = payouts.map((p: any) => ({
    Source: p.income_sources?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

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
        onClose={() => { setSlideOverOpen(false); setEditingSource(null) }}
        onSaved={async () => {
          setSources(await getActiveSources(user.id))
          setArchivedSources(await getArchivedSources(user.id))
        }}
      />

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

      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(id) => {
            setPendingUnarchiveId(id)
            setConfirmUnarchiveOpen(true)
          }}
        />
      )}

      {activeTab === "payouts" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Payouts</h2>
          <CSVLink
            data={csvData}
            filename="HavenOne_Payouts.csv"
            className="bg-[#C6A664] px-4 py-2 rounded-md text-[#0A1E2D]"
          >
            Export CSV
          </CSVLink>
        </section>
      )}

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
