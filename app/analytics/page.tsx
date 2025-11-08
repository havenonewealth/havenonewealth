'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts'

export default function AnalyticsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<any[]>([])
  const [forecast, setForecast] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [expectedVsActual, setExpectedVsActual] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else fetchData()
    }
    init()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    try {
      const [
        { data: summaryData },
        { data: forecastData },
        { data: insightData },
        { data: expectedData }
      ] = await Promise.all([
        supabase.from('v_user_payout_summary').select('*').eq('user_id', user.id),
        supabase.rpc('get_monthly_forecast', { user_uuid: user.id }),
        supabase.from('v_user_insights').select('*').eq('user_id', user.id),
        supabase.from('v_user_expected_vs_actual').select('*').eq('user_id', user.id)
      ])

      setSummary(summaryData || [])
      setForecast(forecastData || [])
      setInsights(insightData || [])
      setExpectedVsActual(expectedData || [])
    } catch (err: any) {
      setMessage('Error loading analytics: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalEarnings = insights.reduce((sum, i) => sum + (i.total_earned || 0), 0)
  const avgPayout = insights.length ? insights.reduce((sum, i) => sum + (i.avg_payout || 0), 0) / insights.length : 0
  const ytdEarnings = forecast
    .filter((f: any) => f.month?.startsWith('2025'))
    .reduce((sum: number, f: any) => sum + (f.total || 0), 0)
  const nextForecast = forecast.length ? forecast[forecast.length - 1].forecast || 0 : 0

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} priority />
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/payouts')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Payouts
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
            >
              Logout
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Advanced Analytics</h1>
        <p className="text-gray-600 mb-8 text-[15px]">
          Gain deeper insights into your royalties, residuals, and performance trends.
        </p>

        {message && <p className="text-sm mb-4 text-red-600">{message}</p>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <svg
              className="animate-spin h-8 w-8 text-[#C6A664] mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              />
            </svg>
            <p>Loading analytics...</p>
          </div>
        ) : summary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
            <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={120} height={120} className="mb-6" />
            <h2 className="text-2xl font-semibold text-[#0A1E2D] mb-2">No Payout Data Yet</h2>
            <p className="max-w-md mb-6">
              Once you start recording royalties and residuals, your analytics will appear here.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-5 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Add Your First Source
            </button>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-[#fafafa] p-5 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-500">Total Earnings</p>
                <h3 className="text-2xl font-bold text-[#0A1E2D]">${totalEarnings.toFixed(2)}</h3>
              </div>
              <div className="bg-[#fafafa] p-5 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-500">Avg Payout</p>
                <h3 className="text-2xl font-bold text-[#0A1E2D]">${avgPayout.toFixed(2)}</h3>
              </div>
              <div className="bg-[#fafafa] p-5 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-500">YTD Earnings</p>
                <h3 className="text-2xl font-bold text-[#0A1E2D]">${ytdEarnings.toFixed(2)}</h3>
              </div>
              <div className="bg-[#fafafa] p-5 rounded-lg shadow-sm text-center">
                <p className="text-sm text-gray-500">Forecast Next Month</p>
                <h3 className="text-2xl font-bold text-[#C6A664]">${nextForecast.toFixed(2)}</h3>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm">
                <h2 className="font-semibold mb-4 text-[#0A1E2D]">Earnings by Source</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={summary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="total_amount" fill="#C6A664" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm">
                <h2 className="font-semibold mb-4 text-[#0A1E2D]">Source Distribution</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={summary} dataKey="total_amount" nameKey="source_name" outerRadius={100} label>
                      {summary.map((_, i) => (
                        <Cell key={i} fill="#C6A664" />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expected vs Actual */}
            <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm mb-8">
              <h2 className="font-semibold mb-4 text-[#0A1E2D]">Expected vs Actual Earnings</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expectedVsActual}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source_name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="expected_amount" fill="#E0C878" name="Expected" />
                  <Bar dataKey="actual_earned" fill="#C6A664" name="Actual" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast Line */}
            <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm mb-8">
              <h2 className="font-semibold mb-4 text-[#0A1E2D]">Actual vs Forecast Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#C6A664" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="forecast" stroke="#999" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Smart Insights */}
            <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm">
            <h2 className="font-semibold mb-4 text-[#0A1E2D]">Smart Insights</h2>

            {expectedVsActual.length === 0 ? (
                <p className="text-gray-500">Not enough data yet for performance insights.</p>
            ) : (
                <>
                {/* Portfolio Summary Line */}
                {(() => {
                    const totalExpected = expectedVsActual.reduce(
                    (sum, i) => sum + (i.expected_amount || 0),
                    0
                    )
                    const totalActual = expectedVsActual.reduce(
                    (sum, i) => sum + (i.actual_earned || 0),
                    0
                    )
                    const ratio = totalExpected > 0 ? (totalActual / totalExpected) * 100 : 0
                    let summaryText = ''
                    if (ratio >= 110) {
                    summaryText = `Your portfolio outperformed expectations by ${(
                        ratio - 100
                    ).toFixed(1)}%, showing strong momentum across income sources.`
                    } else if (ratio >= 90) {
                    summaryText = `Your portfolio performed close to expectations at ${ratio.toFixed(
                        1
                    )}% of projected earnings.`
                    } else {
                    summaryText = `Your portfolio achieved ${ratio.toFixed(
                        1
                    )}% of expected earnings this period, indicating potential missed payouts or seasonal fluctuation.`
                    }
                    return (
                    <p className="mb-4 text-[15px] text-gray-700 font-medium">
                        {summaryText}
                    </p>
                    )
                })()}

                {/* Individual Source Insights with Performance Badges + Animated Heatmap + Tooltips */}
                <ul className="space-y-6">
                {expectedVsActual.map((item, idx) => {
                    const { source_name, actual_earned, expected_amount } = item
                    const variance = expected_amount
                    ? ((actual_earned - expected_amount) / expected_amount) * 100
                    : 0

                    let insight = ''
                    let badgeText = ''
                    let badgeColor = ''
                    let barColor = ''

                    if (variance > 10) {
                    insight = `${source_name} outperformed expectations by ${variance.toFixed(
                        1
                    )}%, earning $${actual_earned.toFixed(
                        2
                    )} against a projected $${expected_amount.toFixed(2)}.`
                    badgeText = 'Top Performer'
                    badgeColor = 'bg-[#C6A664] text-[#0A1E2D]'
                    barColor = '#C6A664'
                    } else if (variance < -10) {
                    insight = `${source_name} underperformed by ${Math.abs(
                        variance
                    ).toFixed(1)}%, earning $${actual_earned.toFixed(
                        2
                    )} out of an expected $${expected_amount.toFixed(2)}.`
                    badgeText = 'At Risk'
                    badgeColor = 'bg-[#8B0000] text-white'
                    barColor = '#8B0000'
                    } else {
                    insight = `${source_name} met expectations, with $${actual_earned.toFixed(
                        2
                    )} earned vs $${expected_amount.toFixed(2)} projected.`
                    badgeText = 'On Target'
                    badgeColor = 'bg-[#0A1E2D] text-[#C6A664]'
                    barColor = '#0A1E2D'
                    }

                    const [barWidth, setBarWidth] = useState(0)
                    const targetWidth = Math.min(Math.abs(variance), 100)

                    useEffect(() => {
                    const timer = setTimeout(() => setBarWidth(targetWidth), 200 * (idx + 1))
                    return () => clearTimeout(timer)
                    }, [targetWidth])

                    return (
                    <li key={idx} className="text-gray-700 relative group">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span>{insight}</span>
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor}`}
                        >
                            {badgeText}
                        </span>
                        </div>

                        {/* Animated Performance Bar with Tooltip */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden relative">
                        <div
                            style={{
                            width: `${barWidth}%`,
                            backgroundColor: barColor,
                            height: '100%',
                            borderRadius: '9999px',
                            transition: 'width 1s ease-in-out',
                            }}
                        ></div>

                        {/* Tooltip on Hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 opacity-0 group-hover:opacity-100 bg-[#0A1E2D] text-[#C6A664] text-xs px-3 py-1 rounded-md shadow-md transition-opacity duration-300">
                            {variance >= 0
                            ? `+${variance.toFixed(1)}% (${actual_earned.toFixed(2)} / ${expected_amount.toFixed(2)})`
                            : `${variance.toFixed(1)}% (${actual_earned.toFixed(2)} / ${expected_amount.toFixed(2)})`}
                        </div>
                        </div>
                    </li>
                    )
                })}
                </ul>

                </>
            )}
            </div>

          </>
        )}
      </div>
    </main>
  )
}
