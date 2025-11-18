'use client'

import React from 'react'
import ReactECharts from 'echarts-for-react'
import { PortfolioAggregate, MonthlyTrend } from '@/lib/supabase/admin'

interface Props {
  aggregates: PortfolioAggregate[]
  trends: MonthlyTrend[]
}

export default function SourceAnalyticsChart({ aggregates, trends }: Props) {
  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Expected', 'Payout'] },
    xAxis: {
      type: 'category',
      data: trends.map(t => t.month)
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Expected',
        type: 'bar',
        data: aggregates.map(a => a.total_expected)
      },
      {
        name: 'Payout',
        type: 'line',
        data: trends.map(t => t.total_payout)
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: 350 }} />
}
