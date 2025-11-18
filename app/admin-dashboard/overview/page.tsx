'use client'

import { useEffect, useState } from 'react'

import {
  AdminSummary,
  PortfolioAggregate,
  MonthlyTrend,
  RecentPayout,
  AppUser
} from '@/lib/types'

import {
  getAdminGlobalSummary,
  getAdminPortfolioAggregates,
  getAdminMonthlyTrends,
  getAdminRecentPayouts,
  getAllUsers
} from '@/lib/supabase/admin'

import KPI from '@/components/KPI'
import GlobalPayoutChart from '@/components/admin-dashboard/GlobalPayoutChart'
import MonthlyTrendsChart from '@/components/admin-dashboard/MonthlyTrendsChart'
import RecentPayoutsTable from '@/components/admin-dashboard/RecentPayoutsTable'
import UserManagementTable from '@/components/admin-dashboard/UserManagementTable'

export default function AdminOverviewPage() {
  // FIX 1: Explicit state typing prevents "never[]" errors
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [aggregates, setAggregates] = useState<PortfolioAggregate[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [recent, setRecent] = useState<RecentPayout[]>([])
  const [users, setUsers] = useState<AppUser[]>([])

  useEffect(() => {
    async function load() {
      // FIX 2: Explicitly typed results
      const s: AdminSummary | null = await getAdminGlobalSummary()
      const a: PortfolioAggregate[] = await getAdminPortfolioAggregates()
      const t: MonthlyTrend[] = await getAdminMonthlyTrends()
      const r: RecentPayout[] = await getAdminRecentPayouts()
      const u: AppUser[] = await getAllUsers()

      setSummary(s)
      setAggregates(a)
      setTrends(t)
      setRecent(r)
      setUsers(u)
    }

    load()
  }, [])

  if (!summary) {
    return <div className="p-10">Loading...</div>
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard Overview</h1>

      <div className="mb-10">
        <KPI
          title="Total Payout Amount"
          value={summary.total_payout_amount}
          sub={`${summary.total_sources} Sources • ${summary.total_payouts} Payouts`}
        />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Global Payout Distribution</h2>
        <GlobalPayoutChart aggregates={aggregates} />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
        <MonthlyTrendsChart trends={trends} />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Recent Payouts</h2>
        <RecentPayoutsTable payouts={recent} />
      </div>

      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <UserManagementTable users={users} />
      </div>
    </div>
  )
}
