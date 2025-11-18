'use client'

import ReactECharts from 'echarts-for-react'
import { MonthlyTrend } from '@/lib/types'

interface Props {
  trends: MonthlyTrend[]
}

export default function MonthlyTrendsChart({ trends }: Props) {
  if (!trends || trends.length === 0) {
    return (
      <div className="border rounded-lg p-6 bg-white shadow-sm">
        <p>No monthly trend data available.</p>
      </div>
    )
  }

  // Extract data
  const months = trends.map(t => t.month)
  const payouts = trends.map(t => t.total_payout)
  const payments = trends.map(t => t.total_payments)

  // Chart options
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const payout = params.find((p: any) => p.seriesName === 'Total Payout')
        const payment = params.find((p: any) => p.seriesName === 'Payments Received')

        return `
          <div>
            <strong>${params[0].name}</strong><br/>
            Total Payout: $${payout?.value?.toLocaleString() || 0}<br/>
            Payments Received: ${payment?.value?.toLocaleString() || 0}
          </div>
        `
      }
    },

    legend: {
      data: ['Total Payout', 'Payments Received']
    },

    xAxis: {
      type: 'category',
      data: months
    },

    yAxis: {
      type: 'value'
    },

    series: [
      {
        name: 'Total Payout',
        type: 'line',
        smooth: true,
        data: payouts,
        lineStyle: { width: 3 }
      },
      {
        name: 'Payments Received',
        type: 'line',
        smooth: true,
        data: payments,
        lineStyle: { width: 3 }
      }
    ]
  }

  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <ReactECharts option={option} style={{ height: 400 }} />
    </div>
  )
}
