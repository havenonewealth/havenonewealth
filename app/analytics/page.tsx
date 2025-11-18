'use client'

import { useEffect, useState } from 'react'
import {
  getAdminGlobalSummary,
  getAdminMonthlyTrends,
  AdminSummary,
  MonthlyTrend
} from '@/lib/supabase/admin'

import MonthlyPayoutChart from '@/components/analytics/MonthlyPayoutChart'
import KPI from '@/components/KPI'

export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])

  useEffect(() => {
    async function load() {
      const s = await getAdminGlobalSummary()
      const m = await getAdminMonthlyTrends()

      setSummary(s)
      setMonthlyTrends(m)
    }
    load()
  }, [])

  if (!summary) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Analytics</h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <KPI
          title="Total Earnings"
          value={summary.total_payout_amount}
          sub="Total amount earned across all sources"
        />

        <KPI
          title="Active Sources"
          value={summary.total_sources}
          sub="Number of income sources you manage"
        />

        <KPI
          title="Payouts Received"
          value={summary.total_payouts}
          sub="Completed payouts across your portfolio"
        />
      </div>

      {/* Monthly Trend */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Monthly Payout Trend</h2>
        <MonthlyPayoutChart trends={monthlyTrends} />
      </div>
    </div>
  )
}
