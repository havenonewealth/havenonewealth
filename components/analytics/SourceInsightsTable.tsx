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
  if (!insights.length) {
    return <p className="text-gray-500">No insights available.</p>
  }

  const safe = (n: any) =>
    typeof n === 'number' && !isNaN(n) ? n : 0

  const money = (n: any) =>
    safe(n).toLocaleString('en-US', { style: 'currency', currency: 'USD' })

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
              <td className="p-3">{safe(i.payout_count)}</td>
              <td className="p-3">
                {i.first_payment ? new Date(i.first_payment).toLocaleDateString() : '—'}
              </td>
              <td className="p-3">
                {i.last_payment ? new Date(i.last_payment).toLocaleDateString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
