'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { PortfolioAggregate } from '@/lib/supabase/admin'
import { money } from '@/lib/utils'

// simple color palette for visual separation
const colors = [
  '#0A1E2D',
  '#355070',
  '#6D597A',
  '#B56576',
  '#E56B6F',
  '#EAAC8B',
  '#ffd8a8',
  '#b3e5fc'
]

interface Props {
  aggregates: PortfolioAggregate[]
}

export default function GlobalPayoutChart({ aggregates }: Props) {
  const chartData = aggregates.map((a, idx) => ({
    name: a.name,
    value: a.total_earned,
    itemStyle: { color: colors[idx % colors.length] }
  }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) =>
        `${params.name}: ${money(params.value)} (${params.percent}%)`
    },
    textStyle: { fontFamily: 'Inter' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: { borderColor: '#fff', borderWidth: 2 },
        label: { show: false },
        data: chartData
      }
    ]
  }

  return (
    <div className="space-y-6">
      {/* subtitle */}
      <p className="text-sm text-gray-600">
        Lifetime payout totals across all income sources. Each segment represents
        its contribution to total earnings.
      </p>

      {/* chart */}
      <ReactECharts option={option} style={{ height: 350 }} />

      {/* legend */}
      <div className="flex flex-wrap gap-4 mt-4">
        {aggregates.map((a, idx) => (
          <div key={a.source_id} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ background: colors[idx % colors.length] }}
            />
            <span className="text-sm text-gray-700">
              {a.name} • {money(a.total_earned)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
