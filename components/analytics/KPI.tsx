'use client'

interface InsightRow {
  source_name: string
  total_earned: number | null
  avg_payment: number | null
  payout_count: number | null
  first_payment: string | null
  last_payment: string | null
}

interface KPIProps {
  insights: InsightRow[]
}

export default function KPI({ insights }: KPIProps) {
  if (!insights || insights.length === 0) {
    return <p className="text-gray-500">No insight data available.</p>
  }

  // Safe number helper
  const safe = (n: any) => (typeof n === 'number' && !isNaN(n) ? n : 0)

  // Format money safely
  const formatter = (n: any) =>
    safe(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  // KPI Calculations
  const totalEarned = insights.reduce((sum, r) => sum + safe(r.total_earned), 0)
  const totalPayments = insights.reduce((sum, r) => sum + safe(r.payout_count), 0)

  const avgPayment =
    insights.reduce((sum, r) => sum + safe(r.avg_payment), 0) /
    insights.length

  const highestSource = insights.reduce((max, row) =>
    safe(row.total_earned) > safe(max.total_earned) ? row : max
  )

  const firstPayment = insights
    .map((r) => r.first_payment)
    .filter(Boolean)
    .sort()[0]

  const lastPayment = insights
    .map((r) => r.last_payment)
    .filter(Boolean)
    .sort()
    .reverse()[0]

  const items = [
    { label: 'Total Earned', value: formatter(totalEarned) },
    { label: 'Average Payment', value: formatter(avgPayment) },
    { label: 'Total Payments', value: totalPayments },
    { label: 'Top Source', value: highestSource.source_name },
    {
      label: 'First Payment',
      value: firstPayment
        ? new Date(firstPayment).toLocaleDateString()
        : '—',
    },
    {
      label: 'Last Payment',
      value: lastPayment
        ? new Date(lastPayment).toLocaleDateString()
        : '—',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="border rounded-xl shadow-sm p-6 bg-white hover:shadow-md transition"
        >
          <p className="text-sm text-gray-500">{item.label}</p>
          <p className="text-2xl font-semibold text-[#0A1E2D] mt-1">
            {item.value}
          </p>
        </div>
      ))}
    </div>
  )
}
