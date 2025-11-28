'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'

import {
  getAdminGlobalSummary,
  getAdminPortfolioAggregates,
  getAdminMonthlyTrends,
  getAdminRecentPayouts,
  getAdminEarningsBySource,
  getAdminUserOverview,
  type AdminSummary,
  type PortfolioAggregate,
  type MonthlyTrend,
  type RecentPayout,
  type EarningsBySource,
  type AdminUserOverview
} from '@/lib/supabase/admin'

import KPI from '@/components/admin-dashboard/KPI'
import GlobalPayoutChart from '@/components/admin-dashboard/GlobalPayoutChart'
import MonthlyTrendsChart from '@/components/admin-dashboard/MonthlyTrendsChart'
import RecentPayoutsTable from '@/components/admin-dashboard/RecentPayoutsTable'
import UserManagementTable from '@/components/admin-dashboard/UserManagementTable'

import EarningsBySourceChart from '@/components/analytics/EarningsBySourceChart'
import SourceContributionPie from '@/components/analytics/SourceContributionPie'
import SourceInsightsTable from '@/components/analytics/SourceInsightsTable'
import CreateUserModal from '@/components/admin-dashboard/CreateUserModal'

/* ============================================================
   UNIVERSAL SAFE NUMBER CONVERSION
============================================================ */
function safeNumber(n: any, fallback = 0) {
  return typeof n === 'number' && !isNaN(n) && n !== null ? n : fallback
}

/* ============================================================
   TABS
============================================================ */

function OverviewTab({
  summary,
  aggregates,
  monthlyTrends,
  recentPayouts,
  users,
  refresh
}: {
  summary: AdminSummary
  aggregates: PortfolioAggregate[]
  monthlyTrends: MonthlyTrend[]
  recentPayouts: RecentPayout[]
  users: AdminUserOverview[]
  refresh: () => void
}) {
  return (
    <div className="space-y-14">

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPI
          title="Total Portfolio Value"
          value={safeNumber(summary.total_payout_amount)}
          sub={`${summary.total_sources} Sources • ${summary.total_payouts} Payouts`}
          isMoney
        />

        <KPI
          title="Average Payout"
          value={safeNumber(summary.avg_payout_amount)}
          sub="Across all income sources"
          isMoney
        />

        <KPI
          title="Active Users"
          value={users.length}
          sub="Administrators and earners"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Payout Distribution by Source</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border min-h-[320px]">
          <GlobalPayoutChart
            aggregates={aggregates.map(a => ({
              ...a,
              total_earned: safeNumber(a.total_earned),
              payout_count: safeNumber(a.payout_count),
              percent_of_total: safeNumber(a.percent_of_total),
            }))}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Monthly Portfolio Trends</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border min-h-[320px]">
          <MonthlyTrendsChart
            trends={monthlyTrends.map(t => ({
              ...t,
              total_payments: safeNumber(t.total_payments),
              total_payout: safeNumber(t.total_payout)
            }))}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Payout Activity</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border min-h-[320px]">
          <RecentPayoutsTable payouts={recentPayouts} />
        </div>
      </div>

      <div className="mb-20">
        <h2 className="text-xl font-semibold mb-4">User Management</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <UserManagementTable users={users} onUpdated={refresh} />
        </div>
      </div>
    </div>
  )
}

function TrendsTab({ monthlyTrends }: { monthlyTrends: MonthlyTrend[] }) {
  return (
    <div className="space-y-10">
      <h2 className="text-xl font-semibold">Monthly Trend Analysis</h2>
      <div className="bg-white rounded-xl shadow-sm p-6 border min-h-[320px]">
        <MonthlyTrendsChart
          trends={monthlyTrends.map(t => ({
            ...t,
            total_payments: safeNumber(t.total_payments),
            total_payout: safeNumber(t.total_payout),
          }))}
        />
      </div>
    </div>
  )
}

function SourcesTab({ data }: { data: EarningsBySource[] }) {
  const cleaned = data.map(s => ({
    ...s,
    total_earned: safeNumber(s.total_earned),
    payout_count: safeNumber(s.payout_count),
    percent_of_total: safeNumber(s.percent_of_total),
  }))

  const insights = cleaned.map(s => ({
    source_name: s.name,
    total_earned: s.total_earned,
    avg_payment: s.payout_count ? s.total_earned / s.payout_count : 0,
    payout_count: s.payout_count,
    first_payment: null,
    last_payment: s.last_payment_date
  }))

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-semibold mb-4">Earnings by Source</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border min-h-[320px]">
          <EarningsBySourceChart data={cleaned} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Contribution Mix</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border min-h-[320px]">
          <SourceContributionPie data={cleaned} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Source Insights</h2>
        <SourceInsightsTable insights={insights} />
      </div>
    </div>
  )
}

function TimelineTab() {
  return (
    <div className="p-8 text-gray-600">
      Timeline visualizations will be added soon.
    </div>
  )
}

function InsightsTab() {
  return (
    <div className="p-8 text-gray-600 text-lg">
      AI-generated insights coming soon.
    </div>
  )
}

/* ============================================================
   MAIN PAGE
============================================================ */

export default function AdminDashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [aggregates, setAggregates] = useState<PortfolioAggregate[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [recentPayouts, setRecentPayouts] = useState<RecentPayout[]>([])
  const [sourcesData, setSourcesData] = useState<EarningsBySource[]>([])
  const [userOverview, setUserOverview] = useState<AdminUserOverview[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  const [showCreateUser, setShowCreateUser] = useState(false)

  async function loadAll() {
    setLoading(true)
    setSummary(await getAdminGlobalSummary())
    setAggregates(await getAdminPortfolioAggregates())
    setMonthlyTrends(await getAdminMonthlyTrends())
    setRecentPayouts(await getAdminRecentPayouts())
    setSourcesData(await getAdminEarningsBySource())
    setUserOverview(await getAdminUserOverview())
    setLoading(false)
  }

  useEffect(() => {
    async function init() {
      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData?.session

      if (!session) return router.push('/login')

      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return router.push('/dashboard')
      }

      await loadAll()
    }

    init()
  }, [router, supabase])

  if (loading || !summary) {
    return <div className="p-10 text-gray-500">Loading admin analytics…</div>
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">

      <div className="flex justify-between items-center mb-10">
        <Image src="/HOW2Logo.png" alt="HOW" width={150} height={50} />

        <div className="flex gap-4">
          <button
            onClick={() => setShowCreateUser(true)}
            className="px-4 py-2 bg-[#0A1E2D] text-white font-semibold rounded-md hover:opacity-90"
          >
            Create User
          </button>

          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 text-[#0A1E2D] font-semibold rounded-md hover:bg-gray-300"
          >
            User Dashboard
          </button>

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

      <h1 className="text-3xl font-semibold mb-8">Admin Analytics</h1>

      <div className="flex gap-3 mb-10">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'trends', label: 'Trends' },
          { key: 'sources', label: 'Sources' },
          { key: 'timeline', label: 'Timeline' },
          { key: 'insights', label: 'Insights' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm border font-medium ${activeTab === tab.key
                ? 'bg-[#0A1E2D] text-white border-[#0A1E2D]'
                : 'bg-white text-black border-gray-300 hover:bg-gray-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          summary={summary}
          aggregates={aggregates}
          monthlyTrends={monthlyTrends}
          recentPayouts={recentPayouts}
          users={userOverview}
          refresh={loadAll}
        />
      )}

      {activeTab === 'trends' && <TrendsTab monthlyTrends={monthlyTrends} />}
      {activeTab === 'sources' && <SourcesTab data={sourcesData} />}
      {activeTab === 'timeline' && <TimelineTab />}
      {activeTab === 'insights' && <InsightsTab />}

      <CreateUserModal
        open={showCreateUser}
        setOpen={setShowCreateUser}
        onCreated={loadAll}
      />
    </div>
  )
}
