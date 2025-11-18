import { MonthlyTrend } from "@/lib/types"

interface MonthlyPayoutChartProps {
  trends: MonthlyTrend[]
}

export default function MonthlyPayoutChart({ trends }: MonthlyPayoutChartProps) {
  if (!trends || trends.length === 0) {
    return <div className="text-gray-500">No payout data available</div>
  }

  const labels = trends.map(t => t.month)
  const payoutData = trends.map(t => Number(t.total_payout))

  return (
    <div className="bg-white rounded-xl p-6 shadow">
      <h3 className="text-lg font-semibold mb-4">Monthly Payout Trend</h3>

      <div className="h-64">
        {/* Simple non-ECharts chart using Tailwind to avoid import errors */}
        <div className="relative w-full h-full flex items-end gap-2">
          {payoutData.map((value, i) => (
            <div key={i} className="flex-1 flex flex-col items-center">
              <div
                className="bg-blue-500 w-full rounded"
                style={{
                  height: `${(value / Math.max(...payoutData)) * 100}%`
                }}
              ></div>
              <span className="text-xs mt-1 text-gray-600">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
