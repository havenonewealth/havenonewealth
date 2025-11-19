'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import * as echarts from 'echarts'
import { CSVLink } from 'react-csv'

interface IncomeSource {
  id: string
  user_id: string
  source_name: string
  source_type?: string
  frequency?: string
  expected_amount?: number
}

interface Payout {
  id: string
  amount: number
  payment_date: string
  status: string
  source_id: string
  income_sources?: {
    source_name?: string
  } | null
}

interface AnalyticsRow {
  month: string
  total_payout: number
  total_payments: number
}

export default function Dashboard() {
  const router = useRouter()
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([])
  const [activeTab, setActiveTab] = useState<'sources' | 'payouts' | 'analytics'>('sources')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

  const formatCurrency = (v: number | undefined) =>
    v ? v.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: roleData } = await supabase.from('users').select('role').eq('id', user.id).single()
      setUserRole(roleData?.role || null)

      await Promise.all([fetchSources(user.id), fetchPayouts(user.id), fetchAnalytics(user.id)])
      setLoading(false)
    }
    init()
  }, [router])

  const fetchSources = async (userId: string) => {
    const { data } = await supabase.from('income_sources').select('*').eq('user_id', userId)
    setSources((data as IncomeSource[]) || [])
  }

  const fetchPayouts = async (userId: string) => {
    const { data } = await supabase
      .from('payouts')
      .select('id, amount, payment_date, status, source_id, income_sources(source_name)')
      .eq('user_id', userId)

    setPayouts((data as Payout[]) || [])
  }

  const fetchAnalytics = async (userId: string) => {
    const { data } = await supabase.rpc('get_user_monthly_trends', { uid: userId })
    setAnalytics((data as AnalyticsRow[]) || [])
  }

  // --------------------------
  // FIXED CHART RENDERING BLOCK
  // --------------------------
  useEffect(() => {
    if (activeTab !== 'analytics') return
    if (!analytics.length) return
    if (!chartRef.current) return

    let chart = echarts.getInstanceByDom(chartRef.current)
    if (!chart) chart = echarts.init(chartRef.current)

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total Payout ($)', 'Number of Payments'] },
      xAxis: {
        type: 'category',
        data: analytics.map((a) => a.month)
      },
      yAxis: [
        {
          type: 'value',
          name: 'Total Payout ($)',
          position: 'left'
        },
        {
          type: 'value',
          name: 'Number of Payments',
          position: 'right'
        }
      ],
      series: [
        {
          name: 'Total Payout ($)',
          type: 'bar',
          data: analytics.map((a) => a.total_payout),
          itemStyle: { color: '#C6A664' }
        },
        {
          name: 'Number of Payments',
          type: 'line',
          yAxisIndex: 1,
          data: analytics.map((a) => a.total_payments),
          itemStyle: { color: '#0A1E2D' }
        }
      ]
    }

    // This avoids the overload type conflict
    chart.setOption(option as any)

    const handleResize = () => chart && chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart && chart.dispose()
    }
  }, [activeTab, analytics])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-[#C6A664]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
          </svg>
          <p>Loading dashboard...</p>
        </div>
      </main>
    )
  }

  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || '—',
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'sources' ? 'bg-[#C6A664] text-[#0A1E2D]' : 'bg-gray-200 text-gray-800'}`}
            >
              Sources
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'payouts' ? 'bg-[#C6A664] text-[#0A1E2D]' : 'bg-gray-200 text-gray-800'}`}
            >
              Payouts
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-2 rounded-md font-semibold ${activeTab === 'analytics' ? 'bg-[#C6A664] text-[#0A1E2D]' : 'bg-gray-200 text-gray-800'}`}
            >
              Analytics
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => router.push('/admin-dashboard')}
                className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
              >
                Admin
              </button>
            )}
            <CSVLink
              data={csvData}
              filename={`HavenOne_Payouts_${new Date().toISOString().slice(0, 10)}.csv`}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655]"
            >
              Export CSV
            </CSVLink>
            <button
              onClick={handleLogout}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664]"
            >
              Logout
            </button>
          </div>
        </div>

        {activeTab === 'sources' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Income Sources</h2>
            {sources.length === 0 ? (
              <p className="text-gray-500">No income sources found.</p>
            ) : (
              <ul className="space-y-3">
                {sources.map((s) => (
                  <li key={s.id} className="p-4 border rounded-lg shadow-sm hover:shadow-md">
                    <p className="text-lg font-semibold">{s.source_name}</p>
                    <p className="text-sm text-gray-600">
                      {s.source_type || '—'} • {s.frequency || '—'} • {formatCurrency(s.expected_amount)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {activeTab === 'payouts' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Payouts</h2>
            {payouts.length === 0 ? (
              <p className="text-gray-500">No payouts found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-[#f9f7f3]">
                    <tr>
                      <th className="p-3 text-left">Source</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-[#fdfbf7]">
                        <td className="p-3">{p.income_sources?.source_name || '—'}</td>
                        <td className="p-3">{formatCurrency(p.amount)}</td>
                        <td className="p-3">
                          {new Date(p.payment_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </td>
                        <td
                          className={`p-3 capitalize ${
                            p.status === 'Paid'
                              ? 'text-green-600'
                              : p.status === 'Pending'
                              ? 'text-yellow-600'
                              : 'text-gray-800'
                          }`}
                        >
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {activeTab === 'analytics' && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">Analytics</h2>
            {analytics.length === 0 ? (
              <p className="text-gray-500">No analytics data available.</p>
            ) : (
              <div ref={chartRef} style={{ height: '400px', width: '100%' }} />
            )}
          </section>
        )}
      </div>
    </main>
  )
}
