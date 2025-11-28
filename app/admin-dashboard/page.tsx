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

/* --------------------------------------------------
   Safe number conversion
-------------------------------------------------- */
function safeNumber(n: any, fallback = 0): number {
  if (n === null || n === undefined) return fallback
  const num = Number(n)
  return isNaN(num) ? fallback : num
}

/* --------------------------------------------------
   OVERVIEW TAB
-------------------------------------------------- */

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
              percent_of_total: safeNumber(a.percent_of_total)
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

/* --------------------------------------------------
   TRENDS TAB
-------------------------------------------------- */

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

/* --------------------------------------------------
   SOURCES TAB
-------------------------------------------------- */

function SourcesTab({ data }: { data: EarningsBySource[] }) {
  const cleaned = data.map(s => ({
    source_id: s.source_id,
    name: s.name,
    total_earned: safeNumber(s.total_earned),
    payout_count: safeNumber(s.payout_count),
    percent_of_total: safeNumber(s.percent_of_total),
    last_payment_date: s.last_payment_date
  }))

  const insights = cleaned.map(s => ({
    source_name: s.name,
    total_earned: s.total_earned,
    payout_count: s.payout_count,
    avg_payment: s.payout_count > 0 ? s.total_earned / s.payout_count : 0,
    first_payment: s.last_payment_date || 'No payments',
    last_payment: s.last_payment_date || 'No payments'
  }))

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-semibold mb-4">Earnings by Source</h2>
        <div className="bg-white p-6 rounded-xl border min-h-[320px]">
          <EarningsBySourceChart data={cleaned} />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Contribution Mix</h2>
        <div className="bg-white p-6 rounded-xl border min-h-[320px]">
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

/* --------------------------------------------------
   TIMELINE TAB
-------------------------------------------------- */

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
              {p.source_name} • ${safeNumber(p.amount).toLocaleString()}
            </p>
            <p className="text-gray-600 text-sm">{p.payout_date}</p>
            <p className="text-gray-600 text-sm">{p.user_email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

/* --------------------------------------------------
   INSIGHTS TAB
-------------------------------------------------- */

function InsightsTab({
  summary,
  recentPayouts,
  monthlyTrends,
  sources
}: {
  summary: AdminSummary
  recentPayouts: RecentPayout[]
  monthlyTrends: MonthlyTrend[]
  sources: EarningsBySource[]
}) {
  const total = summary.total_payout_amount || 0
  const growth = summary.month_over_month_growth || 0
  const topSource = summary.top_source_name || 'N/A'
  const topSourceAmount = summary.top_source_amount || 0

  const last10 = recentPayouts.slice(0, 10)

  const concentration = total > 0
    ? ((topSourceAmount / total) * 100).toFixed(1)
    : '0'

  const monthTrendLabel =
    growth > 0
      ? `Portfolio is growing (${growth.toFixed(1)} percent MoM increase).`
      : growth < 0
        ? `Portfolio is contracting (${growth.toFixed(1)} percent MoM decline).`
        : `No change from last month.`

  const riskIndicators = []
  if (Number(concentration) > 45) {
    riskIndicators.push(
      `High revenue concentration: ${concentration} percent of total earnings are driven by ${topSource}.`
    )
  }
  if (summary.payouts_this_month === 0) {
    riskIndicators.push(`No payouts recorded so far this month.`)
  }
  function money(n: any) {
    const val = Number(n)
    if (!val || isNaN(val)) return '$0.00'
    return val.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD'
    })
  }

  if (monthlyTrends.length >= 2) {
    const last = monthlyTrends[0].total_payout
    const prev = monthlyTrends[1].total_payout

    if (Number(last) < Number(prev)) {
      riskIndicators.push(
        `Month-over-month payout total decreased from ${money(prev)} to ${money(last)}.`
      )
    }
  }

  return (
    <div className="space-y-8 bg-white p-8 rounded-xl border shadow-sm">

      {/* Title */}
      <h2 className="text-2xl font-semibold">Executive Insights</h2>

      {/* Section: Summary */}
      <div className="space-y-3">
        <p className="text-gray-700 text-lg">
          These insights summarize the current performance, trends, and risks across
          the Haven One Wealth portfolio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium">Total Earnings</p>
            <p className="text-xl font-semibold">
              ${total.toLocaleString()}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium">Top Source</p>
            <p className="text-xl font-semibold">{topSource}</p>
            <p className="text-gray-700">
              ${topSourceAmount.toLocaleString()}
            </p>
          </div>
          <div className="p-4 border rounded-lg bg-gray-50">
            <p className="font-medium">MoM Growth</p>
            <p className={`text-xl font-semibold ${growth >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {growth.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Section: Narrative Insight */}
      <div className="p-6 bg-gray-50 rounded-lg border">
        <h3 className="text-lg font-semibold mb-3">Performance Narrative</h3>

        <p className="text-gray-800 leading-relaxed">
          {monthTrendLabel} The current top-performing source is <strong>{topSource}</strong>,
          contributing <strong>{concentration} percent</strong> of all historical earnings. Earnings
          activity across the system shows {recentPayouts.length > 0
            ? 'consistent payout volume with recent activity logged.'
            : 'no recent payout activity.'}
        </p>
      </div>

      {/* Section: Recent Payouts */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Latest Payout Activity</h3>

        {last10.length === 0 ? (
          <p className="text-gray-600">No payout activity found.</p>
        ) : (
          <div className="space-y-4">
            {last10.map(p => (
              <div
                key={p.id}
                className="p-4 border rounded-md bg-white shadow-sm"
              >
                <p className="font-semibold">{p.source_name}</p>
                <p>${p.amount.toLocaleString()}</p>
                <p className="text-sm text-gray-600">{p.payout_date}</p>
                <p className="text-sm text-gray-600">{p.user_email}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section: Risk Indicators */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Risk Indicators</h3>
        {riskIndicators.length === 0 ? (
          <p className="text-gray-600">No significant risks identified.</p>
        ) : (
          <ul className="list-disc ml-6 text-gray-700 space-y-2">
            {riskIndicators.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}

/* --------------------------------------------------
   MAIN PAGE
-------------------------------------------------- */

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
      {activeTab === 'timeline' && <TimelineTab payouts={recentPayouts} />}
      {activeTab === 'insights' && (
        <InsightsTab
          summary={summary}
          recentPayouts={recentPayouts}
          monthlyTrends={monthlyTrends}
          sources={sourcesData}
        />
      )}

      <CreateUserModal
        open={showCreateUser}
        setOpen={setShowCreateUser}
        onCreated={loadAll}
      />
    </div>
  )
}
