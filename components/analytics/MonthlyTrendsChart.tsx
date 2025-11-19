'use client'

import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

interface Trend {
  month: string
  total_payout: number | null
  total_payments: number | null
}

export default function MonthlyTrendsChart({ data }: { data: Trend[] }) {
  const chartRef = useRef<HTMLDivElement>(null)

  const safe = (n: any) =>
    typeof n === 'number' && !isNaN(n) ? n : 0

  useEffect(() => {
    if (!chartRef.current) return
    if (!data || !data.length) return

    const chart = echarts.init(chartRef.current)

    chart.setOption({
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total Payout', 'Payments'] },
      xAxis: {
        type: 'category',
        data: data.map(r => r.month ?? 'Unknown')
      },
      yAxis: [
        { type: 'value', name: 'Payout ($)' },
        { type: 'value', name: 'Count' }
      ],
      series: [
        {
          name: 'Total Payout',
          type: 'bar',
          data: data.map(r => safe(r.total_payout)),
          itemStyle: { color: '#C6A664' }
        },
        {
          name: 'Payments',
          type: 'line',
          yAxisIndex: 1,
          data: data.map(r => safe(r.total_payments)),
          itemStyle: { color: '#0A1E2D' }
        }
      ]
    })

    return () => chart.dispose()
  }, [data])

  return <div ref={chartRef} className="w-full" style={{ height: 400 }} />
}
