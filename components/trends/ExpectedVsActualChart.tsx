'use client'

import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

import { MonthlyTrend } from '@/lib/types'

export default function ExpectedVsActualChart({
  expected,
  trends
}: {
  expected: number
  trends: MonthlyTrend[]
}) {
  // Build chart rows
  const chartData = trends.map((t) => ({
    month: t.month,
    actual: t.total_payout,
    expected
  }))

  return (
    <div className="w-full h-80 bg-white border border-gray-200 rounded-lg p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
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
          <Legend />

          {/* Expected (Soft Gold) */}
          <Bar
            dataKey="expected"
            fill="#E8D8A5"
            name="Expected"
            radius={[4, 4, 0, 0]}
          />

          {/* Actual (Premium Black/Gold) */}
          <Bar
            dataKey="actual"
            fill="#D4AF37"
            name="Actual"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
