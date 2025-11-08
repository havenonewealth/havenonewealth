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
      const [{ data: summaryData }, { data: forecastData }, { data: insightData }] = await Promise.all([
        supabase.from('v_user_payout_summary').select('*').eq('user_id', user.id),
        supabase.rpc('get_monthly_forecast', { user_uuid: user.id }),
        supabase.from('v_user_insights').select('*').eq('user_id', user.id)
      ])

      setSummary(summaryData || [])
      setForecast(forecastData || [])
      setInsights(insightData || [])
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

        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Advanced Analytics</h1>
        <p className="text-gray-600 mb-8 text-[15px]">Comprehensive insights into your royalties and residual performance.</p>

        {message && <p className="text-sm mb-4 text-red-600">{message}</p>}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <svg className="animate-spin h-8 w-8 text-[#C6A664] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            <p>Loading analytics...</p>
          </div>
        ) : summary.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-gray-600">
            <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={120} height={120} className="mb-6" />
            <h2 className="text-2xl font-semibold text-[#0A1E2D] mb-2">No Payout Data Yet</h2>
            <p className="max-w-md mb-6">Once you start recording royalties and residuals, your analytics will appear here.</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-5 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Add Your First Source
            </button>
          </div>
        ) : (
          <>
            {/* KPI Summary Row */}
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
                    <Pie data={summary} dataKey="total_amount" nameKey="source_name" outerRadius={100} label>
                      {summary.map((_, i) => <Cell key={i} fill="#C6A664" />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Forecast Line Chart */}
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
              <ul className="list-disc ml-5 space-y-2 text-gray-700">
                {insights.slice(0, 3).map((i, idx) => (
                  <li key={idx}>
                    <span className="font-semibold">{i.source_name}</span> earned{' '}
                    <span className="text-[#C6A664] font-semibold">${i.total_earned.toFixed(2)}</span>{' '}
                    across {i.payout_count} payouts since {i.first_payment}.
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
