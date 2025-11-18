import { AdminSummary } from "@/lib/types"

interface InsightsProps {
  summary: AdminSummary
}

export default function Insights({ summary }: InsightsProps) {
  if (!summary) return null

  const totalPayout = Number(summary.total_payout_amount || 0).toLocaleString()
  const avgPayout = Number(summary.avg_payout_amount || 0).toLocaleString()
  const totalSources = summary.total_sources || 0
  const totalPayouts = summary.total_payouts || 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

      {/* Total Payout Amount */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500">Total Payout Amount</h3>
        <p className="text-2xl font-bold mt-2">${totalPayout}</p>
      </div>

      {/* Average Payout */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500">Average Payout</h3>
        <p className="text-2xl font-bold mt-2">${avgPayout}</p>
      </div>

      {/* Total Sources */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500">Active Sources</h3>
        <p className="text-2xl font-bold mt-2">{totalSources}</p>
      </div>

      {/* Total Payouts */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-sm font-semibold text-gray-500">Total Payouts Recorded</h3>
        <p className="text-2xl font-bold mt-2">{totalPayouts}</p>
      </div>

    </div>
  )
}
