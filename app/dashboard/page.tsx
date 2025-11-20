"use client"

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CSVLink } from "react-csv"
import type { IncomeSource, Payout, MonthlyTrend } from "@/lib/types"

import SourceList from "@/components/sources/SourceList"
import ArchivedList from "@/components/sources/ArchivedList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"

import KPI from "@/components/analytics/KPI"
import MonthlyTrendsChart from "@/components/analytics/MonthlyTrendsChart"
import SourceInsightsTable from "@/components/analytics/SourceInsightsTable"

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

  // SlideOver state
  const [slideOpen, setSlideOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // Confirm dialogs
  const [confirmArchiveOpen, setConfirmArchiveOpen] = useState(false)
  const [pendingArchiveId, setPendingArchiveId] = useState<string | null>(null)

  const [confirmUnarchiveOpen, setConfirmUnarchiveOpen] = useState(false)
  const [pendingUnarchiveId, setPendingUnarchiveId] = useState<string | null>(null)

  // Load all dashboard data
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
        .select("*")
        .eq("user_id", userId)
        .order("payment_date", { ascending: false })

      setPayouts(pay || [])

      const { data: trends } = await supabase
        .from("v_user_monthly_trends")
        .select("*")
        .eq("user_id", userId)
        .order("month")

      setMonthlyTrends(trends || [])

      const { data: insightRows } = await supabase
        .from("v_user_insights")
        .select("*")
        .eq("user_id", userId)

      setInsights(insightRows || [])

      setLoading(false)
    }

    load()
  }, [])

  if (loading) return <div>Loading...</div>

  // ARCHIVE
  async function doArchive() {
    if (!pendingArchiveId) return

    await archiveSource(pendingArchiveId)

    setSources(await getActiveSources(user.id))
    setArchivedSources(await getArchivedSources(user.id))

    toast({ title: "Archived", description: "Source archived." })

    setConfirmArchiveOpen(false)
    setPendingArchiveId(null)
  }

  // UNARCHIVE
  async function doUnarchive() {
    if (!pendingUnarchiveId) return

    await unarchiveSource(pendingUnarchiveId)

    setSources(await getActiveSources(user.id))
    setArchivedSources(await getArchivedSources(user.id))

    toast({ title: "Restored", description: "Source unarchived." })

    setConfirmUnarchiveOpen(false)
    setPendingUnarchiveId(null)
  }

  // CSV export
  const csvData = payouts.map((p) => ({
    Source: "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  return (
    <div className="mt-6">

      {/* Archive confirm */}
      <ConfirmDialog
        open={confirmArchiveOpen}
        title="Archive"
        description="Send this source to the archive?"
        onCancel={() => setConfirmArchiveOpen(false)}
        onConfirm={doArchive}
      />

      {/* Unarchive confirm */}
      <ConfirmDialog
        open={confirmUnarchiveOpen}
        title="Restore Source"
        description="Move this source back to active?"
        onCancel={() => setConfirmUnarchiveOpen(false)}
        onConfirm={doUnarchive}
      />

      {/* Slide-over editor */}
      <SourceSlideOver
        initial={editingSource}
        userId={user?.id ?? ""}
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setEditingSource(null) }}
        onSaved={async () => {
          setSources(await getActiveSources(user.id))
          setArchivedSources(await getArchivedSources(user.id))
        }}
      />

      {/* SOURCES */}
      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          onAdd={() => { setEditingSource(null); setSlideOpen(true) }}
          onEdit={(s) => { setEditingSource(s); setSlideOpen(true) }}
          onArchive={(id) => {
            setPendingArchiveId(id)
            setConfirmArchiveOpen(true)
          }}
        />
      )}

      {/* ARCHIVED */}
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
