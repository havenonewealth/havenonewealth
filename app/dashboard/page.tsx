'use client'

import { useEffect, useRef, useState } from 'react'
import { useTabs } from './TabContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import * as echarts from 'echarts'
import { CSVLink } from 'react-csv'
import KPI from '@/components/analytics/KPI'
import MonthlyTrendsChart from '@/components/analytics/MonthlyTrendsChart'
import SourceInsightsTable from '@/components/analytics/SourceInsightsTable'


// -------------------------
// TYPES
// -------------------------
interface IncomeSource {
  id: string
  source_name: string
  source_type?: string
  frequency?: string
  expected_amount?: number
}

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

// -------------------------

export default function DashboardPage() {
  const router = useRouter()
  const { activeTab } = useTabs()

  // FIX: Add proper types to avoid never[]
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [monthlyTrends, setMonthlyTrends] = useState<AnalyticsRow[]>([])
  const [insights, setInsights] = useState<any[]>([])

  const formatCurrency = (v: number | undefined): string =>
    v ? v.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      // Fetch sources
      const { data: src } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', user.id)

      // Fetch payouts
      const { data: pay } = await supabase
        .from('payouts')
        .select('*, income_sources(source_name)')
        .eq('user_id', user.id)

      // Fetch monthly trends
      const { data: trends } = await supabase
        .from('v_user_monthly_trends')
        .select('*')
        .eq('user_id', user.id)
        .order('month')

      // Fetch insights
      const { data: insightRows } = await supabase
        .from('v_user_insights')
        .select('*')
        .eq('user_id', user.id)

      setSources((src ?? []) as IncomeSource[])
      setPayouts((pay ?? []) as Payout[])
      setMonthlyTrends((trends ?? []) as AnalyticsRow[])
      setInsights((insightRows ?? []) as any[])

      setLoading(false)
    }

    load()
  }, [router])


  // -------------------------
  if (loading) return <div>Loading...</div>

  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || '—',
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="mt-6">

      {/* SOURCES TAB */}
      {activeTab === 'sources' && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Income Sources</h2>

          <ul className="space-y-3">
            {sources.map((s: IncomeSource) => (
              <li key={s.id} className="p-4 border rounded-lg shadow-sm">
                <p className="text-lg font-semibold">{s.source_name}</p>

                <p className="text-sm text-gray-600">
                  {s.source_type && <span>{s.source_type} • </span>}
                  {s.frequency && <span>{s.frequency} • </span>}
                  {formatCurrency(s.expected_amount)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PAYOUTS TAB */}
      {activeTab === 'payouts' && (
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
                {payouts.map((p: Payout) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.income_sources?.source_name || '—'}</td>
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
      {activeTab === 'analytics' && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>

          {/* KPI Summary */}
          <KPI insights={insights} />

          {/* Monthly Chart */}
          {monthlyTrends.length === 0 ? (
            <p className="text-gray-500">No monthly trend data available.</p>
          ) : (
            <MonthlyTrendsChart data={monthlyTrends} />
          )}

          {/* Source Insights Table */}
          <SourceInsightsTable insights={insights} />
        </section>
      )}
    </div>
  )
}
