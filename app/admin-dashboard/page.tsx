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

// ---------------------------------------------------------------------------
// TABS
// ---------------------------------------------------------------------------

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

      {/* KPI ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <KPI
          title="Total Portfolio Value"
          value={summary.total_payout_amount}
          sub={`${summary.total_sources} Sources • ${summary.total_payouts} Payouts`}
          isMoney
        />

        <KPI
          title="Average Payout"
          value={summary.avg_payout_amount}
          sub="Across all income sources"
          isMoney
        />

        <KPI
          title="Active Users"
          value={users.length}
          sub="Administrators and earners"
        />
      </div>

      {/* Distribution */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Payout Distribution by Source</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <GlobalPayoutChart aggregates={aggregates} />
        </div>
      </div>

      {/* Monthly Trends */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Monthly Portfolio Trends</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <MonthlyTrendsChart trends={monthlyTrends} />
        </div>
      </div>

      {/* Recent Payouts */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Recent Payout Activity</h2>
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <RecentPayoutsTable payouts={recentPayouts} />
        </div>
      </div>

      {/* User Management */}
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
      <div className="bg-white rounded-xl shadow-sm p-6 border">
        <MonthlyTrendsChart trends={monthlyTrends} />
      </div>
    </div>
  )
}

function SourcesTab({ data }: { data: EarningsBySource[] }) {
  const insights = data.map(s => ({
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
        <EarningsBySourceChart data={data} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Contribution Mix</h2>
        <SourceContributionPie data={data} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Source Insights</h2>
        <SourceInsightsTable insights={insights} />
      </div>
    </div>
  )
}

/* --- NEW TIMELINE TAB (REAL DATA) --- */
function TimelineTab({ payouts }: { payouts: RecentPayout[] }) {
  if (payouts.length === 0) {
    return <div className="p-8 text-gray-600">No timeline data available yet.</div>
  }

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-xl font-semibold">Payout Timeline</h2>

      <div className="space-y-4">
        {payouts.map(p => (
          <div key={p.id} className="p-4 border rounded bg-white shadow-sm">
            <p className="font-semibold">
              {p.source_name} • ${p.amount.toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm">{p.payout_date}</p>
            <p className="text-gray-600 text-sm">{p.user_email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* --- NEW INSIGHTS TAB --- */
function InsightsTab({ summary }: { summary: AdminSummary }) {
  return (
    <div className="space-y-6 p-6 bg-white border rounded-xl shadow">
      <h2 className="text-xl font-semibold">Insights</h2>

      <p className="text-gray-700">
        Automated insights will appear here once full analytics are integrated.
      </p>

      <div className="mt-6 space-y-3">
        <p className="font-semibold">Quick Highlights</p>
        <p>Total Earnings: ${summary.total_payout_amount.toLocaleString()}</p>
        <p>Active Users: {summary.active_users}</p>
        <p>Top Source: {summary.top_source_name}</p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// MAIN PAGE
// ---------------------------------------------------------------------------

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

      {/* Header */}
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

      {/* Tabs */}
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

      {/* CONTENT */}
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
      {activeTab === 'timeline' && <TimelineTab payouts={recentPayouts} />}
      {activeTab === 'insights' && <InsightsTab summary={summary} />}

      {/* Create User Modal */}
      <CreateUserModal
        open={showCreateUser}
        setOpen={setShowCreateUser}
        onCreated={loadAll}
      />
    </div>
  )
}
