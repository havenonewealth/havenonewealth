'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
} from 'chart.js'
import { MonthlyTrend } from '@/lib/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
)

interface Props {
  trends: MonthlyTrend[]
}

export default function SourceMonthlyTrendChart({ trends }: Props) {
  const labels = trends.map((t) => t.month)
  const values = trends.map((t) => t.total_payout)

  const data = {
    labels,
    datasets: [
      {
        label: 'Payout Trend',
        data: values,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.2)',
        tension: 0.3
      }
    ]
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' as const }
    }
  }

  return <Line data={data} options={options} />
}
