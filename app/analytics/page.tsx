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
  Line,
} from 'recharts'

export default function AnalyticsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [expectedVsActual, setExpectedVsActual] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [animatedWidths, setAnimatedWidths] = useState<number[]>([])

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else fetchData()
    }
    checkUser()
  }, [router])

  const fetchData = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return setLoading(false)

    const { data: summaryData } = await supabase
      .from('v_user_payout_summary')
      .select('*')
      .eq('user_id', user.id)

    const { data: monthlyData } = await supabase
      .from('v_user_monthly_payouts')
      .select('*')
      .eq('user_id', user.id)
      .order('month', { ascending: true })

    const { data: expectedData } = await supabase
      .from('v_user_expected_vs_actual')
      .select('*')
      .eq('user_id', user.id)

    setSummary(summaryData || [])
    setMonthly(monthlyData || [])
    setExpectedVsActual(expectedData || [])
    setLoading(false)

    if (expectedData) {
      const widths = expectedData.map((item) => {
        const variance = item.expected_amount
          ? ((item.actual_earned - item.expected_amount) / item.expected_amount) * 100
          : 0
        return Math.min(Math.abs(variance), 100)
      })
      setTimeout(() => setAnimatedWidths(widths), 300)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const totalEarnings = summary.reduce((sum, s) => sum + (s.total_amount || 0), 0)
  const avgPayout = summary.length ? totalEarnings / summary.length : 0
  const forecastNextMonth =
    monthly.length > 0 ? (monthly[monthly.length - 1].total || 0) / 2 : 0

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
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

        {/* Title */}
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
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              ></path>
            </svg>
            <p>Loading analytics...</p>
          </div>
        ) : summary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
            <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={120} height={120} className="mb-6" />
            <h2 className="text-2xl font-semibold text-[#0A1E2D] mb-2">No Payout Data Yet</h2>
            <p className="max-w-md mb-6">Once you start recording royalties and residuals, your insights will appear here.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-5 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Add Your First Source
            </button>
          </div>
        ) : (
          <>
            {/* KPI Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Earnings', value: `$${totalEarnings.toFixed(2)}` },
                { label: 'Avg Payout', value: `$${avgPayout.toFixed(2)}` },
                { label: 'YTD Earnings', value: `$${totalEarnings.toFixed(2)}` },
                { label: 'Forecast Next Month', value: `$${forecastNextMonth.toFixed(2)}` },
              ].map((kpi, i) => (
                <div key={i} className="bg-[#fdfbf7] rounded-xl p-4 border border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-1">{kpi.label}</p>
                  <p className="text-xl font-bold text-[#0A1E2D]">{kpi.value}</p>
                </div>
              ))}
            </div>

            {/* Charts */}
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
                    <Pie data={summary} dataKey="total_amount" nameKey="source_name" outerRadius={100} fill="#C6A664" label>
                      {summary.map((_, i) => <Cell key={i} fill="#C6A664" />)}
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
                  <Bar dataKey="actual_earned" fill="#C6A664" name="Actual" />
                  <Bar dataKey="expected_amount" fill="#e0cfa0" name="Expected" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Forecast Line */}
            <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm mb-10">
              <h2 className="font-semibold mb-4 text-[#0A1E2D]">Actual vs Forecast Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#C6A664" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Smart Insights */}
            <div className="bg-[#fafafa] p-6 rounded-lg shadow-sm">
              <h2 className="font-semibold mb-6 text-[#0A1E2D]">Smart Insights</h2>
              <ul className="space-y-6">
                {expectedVsActual.map((item, idx) => {
                  const variance = item.expected_amount
                    ? ((item.actual_earned - item.expected_amount) / item.expected_amount) * 100
                    : 0
                  const barColor = variance > 10 ? '#C6A664' : variance < -10 ? '#8B0000' : '#0A1E2D'
                  const badgeText = variance > 10 ? 'Top Performer' : variance < -10 ? 'At Risk' : 'On Target'
                  const badgeColor =
                    variance > 10
                      ? 'bg-[#C6A664] text-[#0A1E2D]'
                      : variance < -10
                      ? 'bg-[#8B0000] text-white'
                      : 'bg-[#0A1E2D] text-[#C6A664]'
                  const insight =
                    variance > 10
                      ? `${item.source_name} outperformed by ${variance.toFixed(1)}%.`
                      : variance < -10
                      ? `${item.source_name} underperformed by ${Math.abs(variance).toFixed(1)}%.`
                      : `${item.source_name} met expectations.`

                  return (
                    <li key={idx} className="text-gray-700 relative group">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span>{insight}</span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${badgeColor}`}>{badgeText}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2 overflow-hidden relative">
                        <div
                          style={{
                            width: `${animatedWidths[idx] || 0}%`,
                            backgroundColor: barColor,
                            height: '100%',
                            borderRadius: '9999px',
                            transition: 'width 1.2s ease-in-out',
                          }}
                        ></div>
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-5 opacity-0 group-hover:opacity-100 bg-[#0A1E2D] text-[#C6A664] text-xs px-3 py-1 rounded-md shadow-md transition-opacity duration-300">
                          {variance >= 0
                            ? `+${variance.toFixed(1)}% ($${item.actual_earned.toFixed(2)} / $${item.expected_amount.toFixed(2)})`
                            : `${variance.toFixed(1)}% ($${item.actual_earned.toFixed(2)} / $${item.expected_amount.toFixed(2)})`}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
