'use client'

interface InsightRow {
  source_name: string
  total_earned: number | null
  avg_payment: number | null
  payout_count: number | null
  first_payment: string | null
  last_payment: string | null
}

export default function SourceInsightsTable({ insights }: { insights: InsightRow[] }) {
  if (!insights || insights.length === 0) {
    return <p className="text-gray-500">No insights available.</p>
  }

  const money = (n: number | null | undefined) =>
    typeof n === 'number'
      ? n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
      : '$0.00'

  const safeDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div className="mt-10 overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-[#f9f7f3]">
          <tr>
            <th className="p-3 text-left">Source</th>
            <th className="p-3 text-left">Total Earned</th>
            <th className="p-3 text-left">Avg Payment</th>
            <th className="p-3 text-left">Payments</th>
            <th className="p-3 text-left">First</th>
            <th className="p-3 text-left">Last</th>
          </tr>
        </thead>
        <tbody>
          {insights.map((i, idx) => (
            <tr key={idx} className="border-t hover:bg-[#fdfbf7]">
              <td className="p-3">{i.source_name}</td>
              <td className="p-3">{money(i.total_earned)}</td>
              <td className="p-3">{money(i.avg_payment)}</td>
              <td className="p-3">{i.payout_count ?? 0}</td>
              <td className="p-3">{safeDate(i.first_payment)}</td>
              <td className="p-3">{safeDate(i.last_payment)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
