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

  const [slideOpen, setSlideOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<IncomeSource | null>(null)

  const [confirmUnarchive, setConfirmUnarchive] = useState(false)
  const [unarchiveTarget, setUnarchiveTarget] = useState<IncomeSource | null>(null)

  // ----------------------------------------------------
  // INITIAL LOAD
  // ----------------------------------------------------
  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) return router.push("/login")

      setUser(loggedIn)
      const uid = loggedIn.id

      setSources(await getActiveSources(uid))
      setArchivedSources(await getArchivedSources(uid))
      setPayouts(await getPayouts(uid))

      const { data: trends } = await supabase
        .from("v_user_monthly_trends")
        .select("*")
        .eq("user_id", uid)

      setMonthlyTrends(trends ?? [])

      const { data: insightRows } = await supabase
        .from("v_user_insights")
        .select("*")
        .eq("user_id", uid)

      setInsights(insightRows ?? [])

      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  // ----------------------------------------------------
  // ARCHIVE SOURCE
  // ----------------------------------------------------
  async function doArchive() {
    if (!archiveTarget) return

    await fetch("/api/archive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: archiveTarget.id })
    });


    const uid = user.id

    const updatedActive = await getActiveSources(uid)
    const updatedArchived = await getArchivedSources(uid)

    setSources(updatedActive)
    setArchivedSources(updatedArchived)

    toast({
      title: "Archived",
      description: `${archiveTarget.source_name} moved to Archived.`
    })

    setConfirmArchive(false)
    setArchiveTarget(null)
  }

  // ----------------------------------------------------
  // UNARCHIVE SOURCE
  // ----------------------------------------------------
  async function doUnarchive() {
    if (!unarchiveTarget) return

    await unarchiveSource(unarchiveTarget.id)

    const uid = user.id

    const updatedActive = await getActiveSources(uid)
    const updatedArchived = await getArchivedSources(uid)

    setSources(updatedActive)
    setArchivedSources(updatedArchived)

    toast({
      title: "Restored",
      description: `${unarchiveTarget.source_name} is active again.`
    })

    setConfirmUnarchive(false)
    setUnarchiveTarget(null)
  }

  // ----------------------------------------------------
  // CSV EXPORT
  // ----------------------------------------------------
  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  return (
    <div className="mt-6">

      {/* Archive Modal */}
      <ConfirmDialog
        open={confirmArchive}
        title="Archive Source"
        description="This action moves the source to the Archived tab."
        onCancel={() => setConfirmArchive(false)}
        onConfirm={doArchive}
      />

      {/* Unarchive Modal */}
      <ConfirmDialog
        open={confirmUnarchive}
        title="Restore Source"
        description="This action moves the source back to Active."
        onCancel={() => setConfirmUnarchive(false)}
        onConfirm={doUnarchive}
      />

      {/* Slide-Over Form */}
      <SourceSlideOver
        initial={editingSource}
        userId={user?.id}
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setEditingSource(null) }}
        onSaved={async () => {
          setSources(await getActiveSources(user.id))
          setArchivedSources(await getArchivedSources(user.id))
        }}
      />

      {/* Sources Tab */}
      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          onAdd={() => { setEditingSource(null); setSlideOpen(true) }}
          onEdit={(s) => { setEditingSource(s); setSlideOpen(true) }}
          onArchive={(s) => { setArchiveTarget(s); setConfirmArchive(true) }}
        />
      )}

      {/* Archived Tab */}
      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(s) => { setUnarchiveTarget(s); setConfirmUnarchive(true) }}
        />
      )}

      {/* Payouts Tab */}
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

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <section>
          <KPI insights={insights} />
          {monthlyTrends.length === 0
            ? <p className="text-gray-500">No trend data.</p>
            : <MonthlyTrendsChart data={monthlyTrends} />
          }
          <SourceInsightsTable insights={insights} />
        </section>
      )}
    </div>
  )
}
