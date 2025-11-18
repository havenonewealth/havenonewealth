'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

import {
  getAdminGlobalSummary,
  getAdminPortfolioAggregates,
  getAdminMonthlyTrends,
  getAdminRecentPayouts,
  getAllUsers,
  type AdminSummary,
  type PortfolioAggregate,
  type MonthlyTrend,
  type RecentPayout,
  type AppUser
} from '@/lib/supabase/admin'

import KPI from '@/components/KPI'
import GlobalPayoutChart from '@/components/admin-dashboard/GlobalPayoutChart'
import MonthlyTrendsChart from '@/components/admin-dashboard/MonthlyTrendsChart'
import RecentPayoutsTable from '@/components/admin-dashboard/RecentPayoutsTable'
import UserManagementTable from '@/components/admin-dashboard/UserManagementTable'

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [aggregates, setAggregates] = useState<PortfolioAggregate[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [recentPayouts, setRecentPayouts] = useState<RecentPayout[]>([])
  const [users, setUsers] = useState<AppUser[]>([])

  useEffect(() => {
    async function load() {
      const s = await getAdminGlobalSummary()
      const a = await getAdminPortfolioAggregates()
      const m = await getAdminMonthlyTrends()
      const r = await getAdminRecentPayouts()
      const u = await getAllUsers()

      setSummary(s)
      setAggregates(a)
      setMonthlyTrends(m)
      setRecentPayouts(r)
      setUsers(u)
    }
    load()
  }, [])

  if (!summary) {
    return <div className="p-10 text-gray-500">Loading dashboard...</div>
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <Image src="/havenone-logo.png" alt="Haven One Wealth" width={150} height={150} />
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-gray-100 rounded text-sm">Switch to User View</button>
          <button className="px-4 py-2 bg-black text-white rounded text-sm">Logout</button>
        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <KPI
          title="Total Portfolio Value"
          value={summary.total_payout_amount}
          sub={`${summary.total_sources} Sources  •  ${summary.total_payouts} Payouts`}
        />
        <KPI
          title="Average Payout"
          value={summary.avg_payout_amount}
          sub="Across all income sources"
        />
        <KPI
          title="Active Users"
          value={users.length}
          sub="Administrators and earners"
        />
      </div>

      {/* Global Payout Distribution */}
      <div className="mb-14">
        <h2 className="text-xl font-semibold mb-4">Payout Distribution by Source</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <GlobalPayoutChart aggregates={aggregates} />
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="mb-14">
        <h2 className="text-xl font-semibold mb-4">Monthly Portfolio Trends</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <MonthlyTrendsChart trends={monthlyTrends} />
        </div>
      </div>

      {/* Recent Payout Activity */}
      <div className="mb-14">
        <h2 className="text-xl font-semibold mb-4">Recent Payout Activity</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <RecentPayoutsTable payouts={recentPayouts} />
        </div>
      </div>

      {/* User Management */}
      <div className="mb-20">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <UserManagementTable users={users} />
        </div>
      </div>
    </div>
  )
}
