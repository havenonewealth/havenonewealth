'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import Image from 'next/image'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts'
import PayoutsSection from '@/components/PayoutsSection'

export default function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [summary, setSummary] = useState<any>(null)
  const [forecast, setForecast] = useState<any>(null)
  const [distribution, setDistribution] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: roleData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(roleData?.role || null)
      await fetchData(user.id)
      setLoading(false)
    }
    init()
  }, [])

  const fetchData = async (userId: string) => {
    try {
      const [summaryRes, forecastRes, distRes, monthRes] = await Promise.all([
        supabase.from('v_user_payout_summary').select('*').eq('user_id', userId).single(),
        supabase.from('v_user_annual_forecast').select('*').eq('user_id', userId).single(),
        supabase.from('v_user_expected_vs_actual').select('*').eq('user_id', userId),
        supabase.from('v_user_monthly_payouts').select('*').eq('user_id', userId)
      ])
      setSummary(summaryRes.data || {})
      setForecast(forecastRes.data || {})
      setDistribution(distRes.data || [])
      setMonthly(monthRes.data || [])
    } catch (err) {
      console.error('Error fetching data:', err)
      setMessage('Error loading dashboard.')
    }
  }

  const formatCurrency = (v: number) =>
    v?.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) || '$0'

  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-[#C6A664]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
          </svg>
          <p>Loading your dashboard...</p>
        </div>
      </main>
    )

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button onClick={() => router.push('/analytics')} className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition">Analytics</button>
            {userRole === 'admin' && (
              <button onClick={() => router.push(pathname === '/dashboard' ? '/admin-dashboard' : '/dashboard')}
                className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition">
                {pathname === '/dashboard' ? 'Switch to Admin View' : 'Switch to User View'}
              </button>
            )}
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login') }}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition">Logout</button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-8 text-[#0A1E2D]">Haven One Wealth Dashboard</h1>
        {message && <p className="text-sm text-red-600 mb-4">{message}</p>}

        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#fdfbf7] p-6 rounded-xl border text-center shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Total Income This Year</p>
            <p className="text-2xl font-semibold">{formatCurrency(summary?.total_income)}</p>
          </div>
          <div className="bg-[#fdfbf7] p-6 rounded-xl border text-center shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Unpaid Residuals</p>
            <p className="text-2xl font-semibold text-[#C6A664]">{formatCurrency(summary?.unpaid_residuals)}</p>
          </div>
          <div className="bg-[#fdfbf7] p-6 rounded-xl border text-center shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Upcoming Payments</p>
            <p className="text-2xl font-semibold">{summary?.upcoming_count || 0}</p>
          </div>
          <div className="bg-[#fdfbf7] p-6 rounded-xl border text-center shadow-sm">
            <p className="text-sm text-gray-500 mb-1">Projected Annual Income</p>
            <p className="text-2xl font-semibold">{formatCurrency(forecast?.projected_total)}</p>
          </div>
        </div>

        {/* Global Distribution */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Global Payout Distribution</h2>
          {distribution.length === 0 ? (
            <p className="text-gray-500">No payout data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source_name" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: any) => `$${v}`} />
                <Legend />
                <Bar dataKey="expected_amount" fill="#C6A664" name="Expected ($)" />
                <Bar dataKey="actual_payout" fill="#0A1E2D" name="Actual ($)" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Monthly Trends */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Monthly Trends</h2>
          {monthly.length === 0 ? (
            <p className="text-gray-500">No monthly data available.</p>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(v: any) => `$${v}`} />
                <Legend />
                <Line type="monotone" dataKey="total_payout" stroke="#0A1E2D" strokeWidth={2} name="Total Payout ($)" />
                <Line type="monotone" dataKey="payment_count" stroke="#C6A664" strokeWidth={2} name="Payments" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </section>

        {/* Inline Payouts Section */}
        <PayoutsSection />
      </div>
    </main>
  )
}
