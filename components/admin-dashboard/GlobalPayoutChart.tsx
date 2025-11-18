'use client'
import React from 'react'
import ReactECharts from 'echarts-for-react'
import { PortfolioAggregate } from '@/lib/supabase/admin'

interface Props {
  aggregates: PortfolioAggregate[]
}

export default function GlobalPayoutChart({ aggregates }: Props) {
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: ${c} ({d}%)'
    },
    textStyle: { fontFamily: 'Inter' },
    series: [
      {
        type: 'pie',
        radius: ['45%', '75%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: false
        },
        data: aggregates.map(a => ({
          value: a.total_expected,
          name: a.source_name
        }))
      }
    ]
  }

  return <ReactECharts option={option} style={{ height: 350 }} />
}
