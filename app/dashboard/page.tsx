"use client"

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CSVLink } from "react-csv"
import type { IncomeSource } from "@/lib/types"

import KPI from "@/components/analytics/KPI"
import MonthlyTrendsChart from "@/components/analytics/MonthlyTrendsChart"
import SourceInsightsTable from "@/components/analytics/SourceInsightsTable"

import SourceList from "@/components/sources/SourceList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

// Local client-side delete (soft delete)
async function softDeleteSource(id: string) {
  return supabase
    .from("income_sources")
    .update({ deleted: true, deleted_at: new Date().toISOString() })
    .eq("id", id)
}

async function undoSoftDelete(id: string) {
  return supabase
    .from("income_sources")
    .update({ deleted: false, deleted_at: null })
    .eq("id", id)
}

export default function DashboardPage() {
  const router = useRouter()
  const { activeTab } = useTabs()
  const { toast } = useToast()

  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<any>(null)

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // Confirm delete dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const formatCurrency = (v: number | undefined) =>
    v ? v.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00"

  useEffect(() => {
    async function load() {
      const { data: { user: loggedIn } } = await supabase.auth.getUser()
      if (!loggedIn) return router.push("/login")

      setUser(loggedIn)
      const userId = loggedIn.id

      const { data: src } = await supabase
        .from("income_sources")
        .select("*")
        .eq("user_id", userId)
        .eq("deleted", false)

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

      setSources(src ?? [])
      setPayouts(pay ?? [])
      setMonthlyTrends(trends ?? [])
      setInsights(insightRows ?? [])
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) return <div>Loading...</div>

  const csvData = payouts.map(p => ({
    Source: p.income_sources?.source_name || "-",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  // Delete Handler
  function requestDelete(id: string) {
    setDeleteId(id)
    setDeleteConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deleteId) return

    const id = deleteId
    setDeleteConfirmOpen(false)

    const { error } = await softDeleteSource(id)

    if (error) {
      toast({ title: "Delete failed", description: error.message })
      return
    }

    setSources(prev => prev.filter(s => s.id !== id))

    toast({
      title: "Source deleted",
      description: "Undo is available for a few seconds.",
      action: {
        label: "Undo",
        onClick: async () => {
          const { error: undoError } = await undoSoftDelete(id)

          if (undoError) {
            toast({ title: "Undo failed", description: undoError.message })
            return
          }

          const { data: restored } = await supabase
            .from("income_sources")
            .select("*")
            .eq("id", id)
            .single()

          setSources(prev => [...prev, restored])
          toast({ title: "Restored", description: "The source has been restored." })
        }
      }
    })
  }

  return (
    <div className="mt-6">

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Delete Source?"
        description="This will hide the source but you can undo for a short time."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />

      {/* Sources */}
      {activeTab === "sources" && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Income Sources</h2>

          <SourceSlideOver
            initial={editingSource}
            userId={user?.id ?? ""}
            open={slideOverOpen}
            onClose={() => {
              setSlideOverOpen(false)
              setEditingSource(null)
            }}
            onSaved={async () => {
              const { data } = await supabase
                .from("income_sources")
                .select("*")
                .eq("user_id", user?.id)
                .eq("deleted", false)

              setSources(data ?? [])
            }}
          />

          <SourceList
            sources={sources}
            onAdd={() => {
              setEditingSource(null)
              setSlideOverOpen(true)
            }}
            onEdit={src => {
              setEditingSource(src)
              setSlideOverOpen(true)
            }}
            onDelete={requestDelete}
          />
        </section>
      )}

      {/* Payouts */}
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
                {payouts.map(p => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.income_sources?.source_name || "-"}</td>
                    <td className="p-3">{formatCurrency(p.amount)}</td>
                    <td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <CSVLink
                data={csvData}
                filename={`HavenOne_Payouts_${new Date().toISOString().slice(0, 10)}.csv`}
                className="bg-[#C6A664] px-4 py-2 rounded-md text-[#0A1E2D] font-semibold"
              >
                Export CSV
              </CSVLink>
            </div>
          </div>
        </section>
      )}

      {/* Analytics */}
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
