'use client'

import { useEffect, useState } from 'react'

import {
  AdminSummary,
  MonthlyTrend
} from '@/lib/types'

import {
  getAdminGlobalSummary,
  getAdminMonthlyTrends
} from '@/lib/supabase/admin'

import KPI from '@/components/KPI'
import MonthlyTrendsChart from '@/components/admin-dashboard/MonthlyTrendsChart'

export default function TrendsPage() {
  // FIX 1: Strong typing resolves the AdminSummary mismatch errors
  const [summary, setSummary] = useState<AdminSummary | null>(null)

  // FIX 2: Strong typing removes the "never[]" errors
  const [trends, setTrends] = useState<MonthlyTrend[]>([])

  useEffect(() => {
    async function load() {
      const s: AdminSummary | null = await getAdminGlobalSummary()
      const t: MonthlyTrend[] = await getAdminMonthlyTrends()

      setSummary(s)
      setTrends(t)
    }

    load()
  }, [])

  if (!summary) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Payout Trends</h1>

      <div className="mb-10">
        <KPI
          title="Total Payout Amount"
          value={summary.total_payout_amount}
          sub={`${summary.total_sources} Sources • ${summary.total_payouts} Payouts`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Monthly Payout Trends</h2>
        <MonthlyTrendsChart trends={trends} />
      </div>
    </div>
  )
}
