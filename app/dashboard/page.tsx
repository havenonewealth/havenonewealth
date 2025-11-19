'use client'

import { useEffect, useState } from "react"
import { useTabs } from "./TabContext"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { CSVLink } from "react-csv"
import type { IncomeSource } from "@/lib/types"

// UI components
import KPI from "@/components/analytics/KPI"
import MonthlyTrendsChart from "@/components/analytics/MonthlyTrendsChart"
import SourceInsightsTable from "@/components/analytics/SourceInsightsTable"

import SourceList from "@/components/sources/SourceList"
import SourceSlideOver from "@/components/sources/SourceSlideOver"

import ConfirmDialog from "@/components/ui/confirm-dialog"
import { useToast } from "@/components/ui/use-toast"

// ------------------------------
// Types
// ------------------------------
interface Payout {
  id: string
  amount: number
  payment_date: string
  status: string
  income_sources?: {
    source_name?: string
  } | null
}

interface AnalyticsRow {
  month: string
  total_payout: number
  total_payments: number
}

// ------------------------------

export default function DashboardPage() {
  const router = useRouter()
  const { activeTab } = useTabs()
  const { toast } = useToast()

  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState(true)

  const [user, setUser] = useState<any>(null)

  const [slideOverOpen, setSlideOverOpen] = useState(false)
  const [editingSource, setEditingSource] = useState<IncomeSource | null>(null)

  // DELETE dialog
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)

  const formatCurrency = (v: number | undefined) =>
    v ? v.toLocaleString("en-US", { style: "currency", currency: "USD" }) : "$0.00"

  // ------------------------------
  // Load Data
  // ------------------------------
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

  // CSV export
  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || "—",
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  // ------------------------------
  // DELETE HANDLER
  // ------------------------------
  async function performDelete(id: string) {
    const { error } = await supabase
      .from("income_sources")
      .delete()
      .eq("id", id)

    if (error) {
      toast({ title: "Delete failed", description: error.message })
      return
    }

    setSources(prev => prev.filter(s => s.id !== id))

    toast({
      title: "Source deleted",
      description: "The income source was successfully deleted."
    })
  }

  function handleDeleteRequest(id: string) {
    setPendingDeleteId(id)
    setConfirmOpen(true)
  }

  // ------------------------------
  return (
    <div className="mt-6">

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (pendingDeleteId) performDelete(pendingDeleteId)
          setConfirmOpen(false)
        }}
        title="Delete Income Source"
        description="Are you sure you want to delete this source? This action cannot be undone."
      />

      {/* SOURCES TAB */}
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
              setSources(data ?? [])
            }}
          />

          <SourceList
            sources={sources}
            onAdd={() => {
              setEditingSource(null)
              setSlideOverOpen(true)
            }}
            onEdit={(src) => {
              setEditingSource(src)
              setSlideOverOpen(true)
            }}
            onDelete={handleDeleteRequest}
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
