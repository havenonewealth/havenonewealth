'use client'

import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

import { MonthlyTrend } from '@/lib/types'

export default function TrendsPayoutChart({
  trends
}: {
  trends: MonthlyTrend[]
}) {
  // Format data for chart readability
  const chartData = trends.map((t) => ({
    month: t.month,
    total: t.total_payout
  }))

  return (
    <div className="w-full h-80 bg-white border border-gray-200 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid stroke="#E5E7EB" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px'
            }}
          />
          <Line
            type="monotone"
            dataKey="total"
            stroke="#D4AF37"
            strokeWidth={3}
            dot={{ r: 4, fill: '#D4AF37' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
