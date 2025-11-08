'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from 'recharts'

export default function AnalyticsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [message, setMessage] = useState('')

  const COLORS = ['#C6A664', '#0A1E2D', '#9A8C66', '#b59655']

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else fetchAnalytics()
    }
    checkUser()
  }, [router])

  const fetchAnalytics = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: summaryData, error: summaryErr } = await supabase
      .from('v_user_payout_summary')
      .select('*')
      .eq('user_id', user.id)

    const { data: monthlyData, error: monthlyErr } = await supabase.rpc('get_monthly_payouts', { user_uuid: user.id })

    if (summaryErr || monthlyErr)
      setMessage('Error loading analytics data.')
    else {
      setSummary(summaryData || [])
      setMonthly(monthlyData || [])
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition">
              Dashboard
            </button>
            <button onClick={() => router.push('/payouts')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition">
              Payouts
            </button>
            <button onClick={handleLogout}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition">
              Logout
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-2">Analytics & Trends</h1>
        <p className="text-gray-600 mb-8 text-[15px]">Visualize your royalty and residual income growth.</p>

        {message && <p className="text-sm mb-4">{message}</p>}

        {/* Empty-State Fallback */}
        {summary.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-[#fafafa] p-12 rounded-xl border border-dashed border-gray-300 text-center">
            <Image src="/HOW2Logo.png" alt="Haven One Wealth" width={120} height={45} className="mb-6" />
            <h2 className="text-xl font-semibold mb-2 text-[#0A1E2D]">No payout data yet</h2>
            <p className="text-gray-600 mb-6 max-w-md">
              Once you start adding payouts tied to your income sources, your performance analytics and trend
              visualizations will appear here automatically.
            </p>
            <button
              onClick={() => router.push('/payouts')}
              className="bg-[#C6A664] text-[#0A1E2D] font-semibold px-6 py-2 rounded-md hover:bg-[#b59655] transition"
            >
              Add a Payout
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Bar Chart – Total per Source */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Earnings by Source</h2>
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

            {/* Pie Chart – Source Distribution */}
            <div>
              <h2 className="text-lg font-semibold mb-3">Source Distribution</h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={summary}
                    dataKey="total_amount"
                    nameKey="source_name"
                    outerRadius={90}
                    label
                  >
                    {summary.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Line Chart – Monthly Trend */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-semibold mb-3">Monthly Payout Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthly}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#0A1E2D" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
