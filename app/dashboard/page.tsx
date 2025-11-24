"use client"

import TestInsertButton from "./TestInsertButton"
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

import { getPayouts } from "@/lib/supabase/payouts"
import {
  getActiveSources,
  getArchivedSources
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

  const [slideOpen, setSlideOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  const [confirmArchive, setConfirmArchive] = useState(false)
  const [archiveTarget, setArchiveTarget] = useState<IncomeSource | null>(null)

  const [confirmUnarchive, setConfirmUnarchive] = useState(false)
  const [unarchiveTarget, setUnarchiveTarget] = useState<IncomeSource | null>(null)

  // -------------------------------------------------------
  // Initial load
  // -------------------------------------------------------
  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) {
        router.push("/login")
        return
      }

      setUser(loggedIn)
      const userId = loggedIn.id

      const [active, archived, payoutsData] = await Promise.all([
        getActiveSources(userId),
        getArchivedSources(userId),
        getPayouts(userId)
      ])

      setSources(active)
      setArchivedSources(archived)
      setPayouts(payoutsData)

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

  // -------------------------------------------------------
  // Archive
  // -------------------------------------------------------
  async function doArchive() {
    if (!archiveTarget || !user) return

    console.log("ARCHIVE:", archiveTarget)

    const { data, error } = await supabase
      .from("income_sources")
      .update({
        archived: true,
        archived_at: new Date().toISOString(),
        deleted: false
      })
      .eq("id", archiveTarget.id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle()

    console.log("ARCHIVE result =", data, error)

    if (error) {
      toast({ title: "Archive failed", description: error.message })
      setConfirmArchive(false)
      setArchiveTarget(null)
      return
    }

    const uid = user.id
    const [active, archived] = await Promise.all([
      getActiveSources(uid),
      getArchivedSources(uid)
    ])

    setSources(active)
    setArchivedSources(archived)

    toast({
      title: "Archived",
      description: `${archiveTarget.source_name} archived.`
    })

    setConfirmArchive(false)
    setArchiveTarget(null)
  }

  // -------------------------------------------------------
  // Unarchive
  // -------------------------------------------------------
  async function doUnarchive() {
    if (!unarchiveTarget || !user) return

    console.log("UNARCHIVE:", unarchiveTarget)

    const { data, error } = await supabase
      .from("income_sources")
      .update({
        archived: false,
        archived_at: null,
        deleted: false
      })
      .eq("id", unarchiveTarget.id)
      .eq("user_id", user.id)
      .select()
      .maybeSingle()

    console.log("UNARCHIVE result =", data, error)

    if (error) {
      toast({ title: "Unarchive failed", description: error.message })
      setConfirmUnarchive(false)
      setUnarchiveTarget(null)
      return
    }

    const uid = user.id
    const [active, archived] = await Promise.all([
      getActiveSources(uid),
      getArchivedSources(uid)
    ])

    setSources(active)
    setArchivedSources(archived)

    toast({ title: "Restored", description: `${unarchiveTarget.source_name} restored.` })

    setConfirmUnarchive(false)
    setUnarchiveTarget(null)
  }

  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  return (
    <div className="mt-6">

      {/* DEVELOPMENT TEST BUTTON */}
      <TestInsertButton />

      {/* Archive dialog */}
      <ConfirmDialog
        open={confirmArchive}
        title="Archive Source"
        description="Move this source to Archived?"
        onCancel={() => setConfirmArchive(false)}
        onConfirm={doArchive}
      />

      {/* Unarchive dialog */}
      <ConfirmDialog
        open={confirmUnarchive}
        title="Unarchive Source"
        description="Restore this source?"
        onCancel={() => setConfirmUnarchive(false)}
        onConfirm={doUnarchive}
      />

      {/* SlideOver editor */}
      <SourceSlideOver
        initial={editingSource}
        userId={user?.id}
        open={slideOpen}
        onClose={() => { setSlideOpen(false); setEditingSource(null) }}
        onSaved={async () => {
          console.log("DASHBOARD: onSaved() triggered")

          const active = await getActiveSources(user.id)
          const archived = await getArchivedSources(user.id)

          console.log("DASHBOARD refreshed active =", active)
          console.log("DASHBOARD refreshed archived =", archived)

          setSources(active)
          setArchivedSources(archived)
        }}
      />

      {/* SOURCES TAB */}
      {activeTab === "sources" && (
        <SourceList
          sources={sources}
          onAdd={() => { setEditingSource(null); setSlideOpen(true) }}
          onEdit={(s) => { setEditingSource(s); setSlideOpen(true) }}
          onArchive={(s) => { setArchiveTarget(s); setConfirmArchive(true) }}
        />
      )}

      {/* ARCHIVED TAB */}
      {activeTab === "archived" && (
        <ArchivedList
          sources={archivedSources}
          onUnarchive={(s) => { setUnarchiveTarget(s); setConfirmUnarchive(true) }}
        />
      )}

      {/* PAYOUTS TAB */}
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

      {/* ANALYTICS TAB */}
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
