"use client"

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CSVLink } from "react-csv"

import type { IncomeSource, Payout, MonthlyTrend } from "@/lib/types"

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

import { getPayouts } from "@/lib/supabase/payouts"

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

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // Archive confirmation modal
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingArchive, setPendingArchive] = useState<IncomeSource | null>(null)

  // Unarchive confirmation modal
  const [confirmUnarchiveOpen, setConfirmUnarchiveOpen] = useState(false)
  const [pendingUnarchive, setPendingUnarchive] = useState<IncomeSource | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) return router.push("/login")

      setUser(loggedIn)
      const userId = loggedIn.id

      setSources(await getActiveSources(userId))
      setArchivedSources(await getArchivedSources(userId))
      setPayouts(await getPayouts(userId))

      const { data: trends } = await supabase
        .from("v_user_monthly_trends")
        .select("*")
        .eq("user_id", userId)
      setMonthlyTrends(trends ?? [])

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
  // Archive Confirm
  // ---------------------------------------------------------------------
  async function handleArchiveConfirm() {
    if (!pendingArchive) return

    await archiveSource(pendingArchive.id)

    const userId = user.id
    setSources(await getActiveSources(userId))
    setArchivedSources(await getArchivedSources(userId))

    toast({
      title: "Archived",
      description: `${pendingArchive.source_name} was archived.`
    })

    setConfirmOpen(false)
    setPendingArchive(null)
  }

  // ---------------------------------------------------------------------
  // Unarchive Confirm
  // ---------------------------------------------------------------------
  async function handleUnarchiveConfirm() {
    if (!pendingUnarchive) return

    await unarchiveSource(pendingUnarchive.id)

    const userId = user.id
    setSources(await getActiveSources(userId))
    setArchivedSources(await getArchivedSources(userId))

    toast({
      title: "Restored",
      description: `${pendingUnarchive.source_name} is active again.`
    })

    setConfirmUnarchiveOpen(false)
    setPendingUnarchive(null)
  }

  // ---------------------------------------------------------------------
  // CSV Export
  // ---------------------------------------------------------------------
  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  return (
    <div className="mt-6">

      {/* Archive Confirmation */}
      <ConfirmDialog
        open={confirmOpen}
        title="Archive Source"
        description="This will move the source to Archived. Continue?"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={handleArchiveConfirm}
      />

      {/* Unarchive Confirmation */}
      <ConfirmDialog
        open={confirmUnarchiveOpen}
        title="Unarchive Source"
        description="Restore this source?"
        onCancel={() => setConfirmUnarchiveOpen(false)}
        onConfirm={handleUnarchiveConfirm}
      />

      {/* SlideOver */}
      <SourceSlideOver
        initial={editingSource}
        userId={user?.id}
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
          onAdd={() => {
            setEditingSource(null)
            setSlideOverOpen(true)
          }}
          onEdit={(s) => {
            setEditingSource(s)
            setSlideOverOpen(true)
          }}
          onArchive={(s) => {
            setPendingArchive(s)
            setConfirmOpen(true)
          }}
        />
      )}

      {/* ARCHIVED SOURCES */}
      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(s) => {
            setPendingUnarchive(s)
            setConfirmUnarchiveOpen(true)
          }}
        />
      )}

      {/* PAYOUTS */}
      {activeTab === "payouts" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Payouts</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border rounded-md">
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
                    <td className="p-3">${p.amount.toLocaleString()}</td>
                    <td className="p-3">
                      {new Date(p.payment_date).toLocaleDateString()}
                    </td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <CSVLink
            data={csvData}
            filename="HavenOne_Payouts.csv"
            className="mt-4 inline-block bg-[#C6A664] px-4 py-2 rounded text-[#0A1E2D]"
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
            <p className="text-gray-500">No trend data.</p>
          ) : (
            <MonthlyTrendsChart data={monthlyTrends} />
          )}

          <SourceInsightsTable insights={insights} />
        </section>
      )}
    </div>
  )
}
