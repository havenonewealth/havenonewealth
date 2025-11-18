'use client'

import { Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { PortfolioAggregate } from '@/lib/types'

ChartJS.register(ArcElement, Tooltip, Legend)

interface Props {
  aggregates: PortfolioAggregate[]
}

export default function SourceSummaryChart({ aggregates }: Props) {
  const labels = aggregates.map((a) => a.source_name)
  const values = aggregates.map((a) => a.total_expected)

  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: ['#0EA5E9', '#10B981', '#6366F1', '#F59E0B', '#EF4444']
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'right' as const }
    }
  }

  return <Doughnut data={data} options={options} />
}
