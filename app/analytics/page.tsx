'use client'

import { useEffect, useState } from 'react'
import {
  getAdminGlobalSummary,
  getAdminMonthlyTrends,
  getAdminEarningsBySource,
  AdminSummary,
  MonthlyTrend,
  EarningsBySource
} from '@/lib/supabase/admin'

import MonthlyPayoutChart from '@/components/analytics/MonthlyPayoutChart'
import KPI from '@/components/admin-dashboard/KPI'
import EarningsBySourceChart from '@/components/analytics/EarningsBySourceChart'
import SourceContributionPie from '@/components/analytics/SourceContributionPie'

/* ------------------------------
   OVERVIEW TAB
------------------------------ */
function OverviewTab({ summary, monthlyTrends }: { summary: AdminSummary; monthlyTrends: MonthlyTrend[] }) {
  return (
    <div className="space-y-12">
      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
      <div>
        <h2 className="text-xl font-semibold mb-4">Monthly Payout Trend</h2>
        <MonthlyPayoutChart trends={monthlyTrends} />
      </div>
    </div>
  )
}

/* ------------------------------
   TRENDS TAB (placeholder for now)
------------------------------ */
function TrendsTab() {
  return (
    <div className="p-6 text-gray-700">
      <p className="text-lg">Your expanded trends dashboard will display here.</p>
    </div>
  )
}

/* ------------------------------
   SOURCES TAB (Fully Implemented)
------------------------------ */
function SourcesTab({ data }: { data: EarningsBySource[] }) {
  const [left, setLeft] = useState<string>(data[0]?.source_id || '')
  const [right, setRight] = useState<string>(data[1]?.source_id || '')

  const metric = (id: string) => data.find((s) => s.source_id === id)!

  return (
    <div className="space-y-12">

      {/* Earnings by Source Bar Chart */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Earnings by Source</h2>
        <EarningsBySourceChart data={data} />
      </div>

      {/* Contribution Pie */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Source Contribution Mix</h2>
        <SourceContributionPie data={data} />
      </div>

      {/* Performance Table */}
      <div className="overflow-x-auto border rounded-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-6">Source Performance Table</h2>
        <table className="min-w-full text-left text-sm">
          <thead className="border-b font-medium">
            <tr>
              <th className="py-3">Source</th>
              <th className="py-3">Total Earned</th>
              <th className="py-3">Payouts</th>
              <th className="py-3">Avg Payout</th>
              <th className="py-3">Last Payout</th>
              <th className="py-3">% Total</th>
            </tr>
          </thead>

          <tbody>
            {data.map((s) => (
              <tr key={s.source_id} className="border-b">
                <td className="py-3">{s.name}</td>
                <td className="py-3">${s.total_earned.toLocaleString()}</td>
                <td className="py-3">{s.payout_count}</td>
                <td className="py-3">
                  {s.payout_count === 0 ? '0' : `$${(s.total_earned / s.payout_count).toFixed(2)}`}
                </td>
                <td className="py-3">{s.last_payment_date || 'N/A'}</td>
                <td className="py-3">{s.percent_of_total}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Comparison Section */}
      <div className="border rounded-lg p-6 bg-white">
        <h2 className="text-xl font-semibold mb-6">Compare Two Sources</h2>

        <div className="flex gap-4 mb-8">
          {/* Source A */}
          <select
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            className="border p-2 rounded"
          >
            {data.map((s) => (
              <option key={s.source_id} value={s.source_id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Source B */}
          <select
            value={right}
            onChange={(e) => setRight(e.target.value)}
            className="border p-2 rounded"
          >
            {data.map((s) => (
              <option key={s.source_id} value={s.source_id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COMPARE */}
          <div className="p-4 border rounded">
            <h3 className="font-semibold text-lg mb-2">{metric(left).name}</h3>
            <p>Total Earned: ${metric(left).total_earned.toLocaleString()}</p>
            <p>Payouts: {metric(left).payout_count}</p>
            <p>Last Payout: {metric(left).last_payment_date || 'N/A'}</p>
          </div>

          {/* RIGHT COMPARE */}
          <div className="p-4 border rounded">
            <h3 className="font-semibold text-lg mb-2">{metric(right).name}</h3>
            <p>Total Earned: ${metric(right).total_earned.toLocaleString()}</p>
            <p>Payouts: {metric(right).payout_count}</p>
            <p>Last Payout: {metric(right).last_payment_date || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------
   TIMELINE TAB (placeholder)
------------------------------ */
function TimelineTab() {
  return (
    <div className="p-6 text-gray-700">
      <p className="text-lg">Your payout event timeline will display here.</p>
    </div>
  )
}

/* ------------------------------
   INSIGHTS TAB (placeholder)
------------------------------ */
function InsightsTab() {
  return (
    <div className="p-6 text-gray-700">
      <p className="text-lg">Your narrative AI financial insights will display here.</p>
    </div>
  )
}

/* ------------------------------
   MAIN PAGE
------------------------------ */
export default function AnalyticsPage() {
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrend[]>([])
  const [sourcesData, setSourcesData] = useState<EarningsBySource[]>([])

  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    async function load() {
      const s = await getAdminGlobalSummary()
      const m = await getAdminMonthlyTrends()
      const src = await getAdminEarningsBySource()

      setSummary(s)
      setMonthlyTrends(m)
      setSourcesData(src)
    }
    load()
  }, [])

  if (!summary) return <div className="p-10">Loading...</div>

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Analytics</h1>

      {/* Tabs */}
      <div className="flex gap-4 mb-10">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'trends', label: 'Trends' },
          { key: 'sources', label: 'Sources' },
          { key: 'timeline', label: 'Timeline' },
          { key: 'insights', label: 'Insights' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium border transition ${activeTab === tab.key
              ? 'bg-black text-white border-black'
              : 'bg-white text-black border-gray-300 hover:bg-gray-100'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <OverviewTab summary={summary} monthlyTrends={monthlyTrends} />
        )}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'sources' && <SourcesTab data={sourcesData} />}
        {activeTab === 'timeline' && <TimelineTab />}
        {activeTab === 'insights' && <InsightsTab />}
      </div>
    </div>
  )
}
