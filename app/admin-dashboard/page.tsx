'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

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

import KPI from '@/components/admin-dashboard/KPI'
import GlobalPayoutChart from '@/components/admin-dashboard/GlobalPayoutChart'
import MonthlyTrendsChart from '@/components/admin-dashboard/MonthlyTrendsChart'
import RecentPayoutsTable from '@/components/admin-dashboard/RecentPayoutsTable'
import UserManagementTable from '@/components/admin-dashboard/UserManagementTable'

export default function AdminDashboardPage() {
  const router = useRouter()

  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [aggregates, setAggregates] = useState<PortfolioAggregate[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [recentPayouts, setRecentPayouts] = useState<RecentPayout[]>([])
  const [users, setUsers] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  // --------------------------------------------------------------
  // Validate user is logged in AND is admin
  // --------------------------------------------------------------
  useEffect(() => {
    async function validateSession() {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/dashboard')
        return
      }

      loadData()
    }

    async function loadData() {
      setLoading(true)

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

      setLoading(false)
    }

    validateSession()
  }, [router])

  if (loading || !summary) {
    return <div className="p-10 text-gray-500">Loading admin dashboard...</div>
  }

  // --------------------------------------------------------------
  // Render
  // --------------------------------------------------------------
  return (
    <div className="p-10 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <Image
          src="/HOW2Logo.png"
          width={150}
          height={50}
          alt="Haven One Wealth Logo"
        />

        <div className="flex gap-4">

          {/* Switch to user dashboard */}
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-[#0A1E2D] font-semibold rounded-md hover:bg-gray-300 transition"
          >
            User View
          </button>

          {/* Logout */}
          <button
            onClick={async () => {
              await supabase.auth.signOut()
              router.push('/login')
            }}
            className="px-4 py-2 bg-[#0A1E2D] text-white font-semibold rounded-md"
          >
            Logout
          </button>

        </div>
      </div>

      <h1 className="text-3xl font-semibold mb-8">Admin Dashboard</h1>

      {/* KPI Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
        <KPI
          title="Total Portfolio Value"
          value={summary.total_payout_amount}
          sub={`${summary.total_sources} Sources • ${summary.total_payouts} Payouts`}
        />
        <KPI
          title="Average Payout"
          value={summary.avg_payout_amount}
          sub="Across entire portfolio"
        />
        <KPI
          title="Active Users"
          value={users.length}
          sub="Admins + Earners"
        />
      </div>

      {/* Distribution by Source */}
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
