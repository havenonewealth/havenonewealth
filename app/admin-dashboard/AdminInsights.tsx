import React from 'react'
import { AdminSummary, PortfolioAggregate, MonthlyTrend, RecentPayout } from '@/lib/supabase/admin'

interface Props {
  summary: AdminSummary
  aggregates: PortfolioAggregate[]
  trends: MonthlyTrend[]
  recent: RecentPayout[]
}

export default function AdminInsights({ summary, aggregates, trends, recent }: Props) {
  const topSource = aggregates.sort((a, b) => b.total_expected - a.total_expected)[0]
  const latestPayout = recent[0]
  const growth =
    trends.length > 1
      ? trends[trends.length - 1].total_payout - trends[trends.length - 2].total_payout
      : 0

  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Executive Insights</h2>

      <ul className="text-sm text-gray-700 space-y-3">
        <li>
          Top performing source is <span className="font-semibold">{topSource?.source_name}</span>
          with ${topSource?.total_expected.toLocaleString()} projected annually.
        </li>

        <li>
          Latest payout was ${latestPayout?.amount.toLocaleString()} from 
          {` ${latestPayout?.source_name}`} on {latestPayout?.payout_date}.
        </li>

        <li>
          Month over month growth is 
          <span className={growth >= 0 ? 'text-green-600' : 'text-red-600'}>
            {growth >= 0 ? ` +${growth.toLocaleString()}` : ` ${growth.toLocaleString()}`}
          </span>.
        </li>

        <li>
          Portfolio contains {summary.total_sources} active income sources and 
          {` ${summary.total_payouts}`} total payouts.
        </li>
      </ul>
    </div>
  )
}
