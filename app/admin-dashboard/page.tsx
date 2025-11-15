'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts'
import { CSVLink } from 'react-csv'
import { logError } from '@/app/utils/logger'

export default function AdminDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'summary' | 'details'>('summary')

  // KPI cards
  const [kpis, setKpis] = useState({
    totalExpected: 0,
    totalPaid: 0,
    totalPending: 0,
    totalScheduled: 0
  })

  useEffect(() => {
    const verifyAdmin = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push('/login')
        setUser(user)
        const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single()
        if (error || !data) return router.push('/dashboard')
        setUserRole(data.role)
        if (data.role !== 'admin') router.push('/dashboard')
        else {
          setAuthorized(true)
          await fetchData()
        }
      } catch (err) {
        await logError('admin-auth', err)
      } finally {
        setLoading(false)
      }
    }
    verifyAdmin()
  }, [router])

  const fetchData = async () => {
    try {
      const [usersData, portfolioView, trendsView, payoutData] = await Promise.all([
        supabase.from('users').select('id, email, role, created_at'),
        supabase.from('v_admin_portfolio_summary').select('*'),
        supabase.from('v_admin_monthly_trends').select('*'),
        supabase.from('payouts').select('*, income_sources(source_name, user_id)')
      ])
      setUsers(usersData.data || [])
      setPortfolioSummary(portfolioView.data || [])
      setMonthlyTrends(trendsView.data || [])
      setPayouts(payoutData.data || [])

      // KPI totals
      const expected = portfolioView.data?.reduce((a, b) => a + (Number(b.expected_amount) || 0), 0) || 0
      const paid = payoutData.data?.filter((p) => p.status === 'Paid').reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0
      const pending = payoutData.data?.filter((p) => p.status === 'Pending').reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0
      const scheduled = payoutData.data?.filter((p) => p.status === 'Scheduled').reduce((a, b) => a + (Number(b.amount) || 0), 0) || 0

      setKpis({ totalExpected: expected, totalPaid: paid, totalPending: pending, totalScheduled: scheduled })
    } catch (err) {
      await logError('admin-fetch', err)
      setMessage('Error loading admin data.')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId)
    if (error) setMessage('Error updating role.')
    else {
      setMessage('User role updated successfully.')
      fetchData()
    }
  }

  const formatCurrency = (v: number) => v?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const exportData = viewMode === 'summary'
    ? portfolioSummary.map((p) => ({
        Source: p.source_name,
        Expected: formatCurrency(Number(p.expected_amount)),
        Payouts: formatCurrency(Number(p.total_payout || 0))
      }))
    : payouts.map((p) => ({
        User: users.find((u) => u.id === p.income_sources?.user_id)?.email || '',
        Source: p.income_sources?.source_name,
        Amount: formatCurrency(Number(p.amount)),
        Date: p.payout_date,
        Status: p.status
      }))

  if (!authorized) return null

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button
              onClick={() => setViewMode(viewMode === 'summary' ? 'details' : 'summary')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655]"
            >
              {viewMode === 'summary' ? 'Switch to Detailed View' : 'Switch to Summary View'}
            </button>
            <CSVLink
              filename={`admin-${viewMode}-export.csv`}
              data={exportData}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664]"
            >
              Export CSV
            </CSVLink>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664]"
            >
              Logout
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-6 text-[#0A1E2D]">Admin Dashboard</h1>
        {message && <p className="text-sm text-gray-700 mb-4">{message}</p>}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-[#fdfbf7] p-6 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Expected</p>
            <p className="text-2xl font-semibold text-[#0A1E2D]">{formatCurrency(kpis.totalExpected)}</p>
          </div>
          <div className="bg-[#fdfbf7] p-6 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">Total Paid</p>
            <p className="text-2xl font-semibold text-green-700">{formatCurrency(kpis.totalPaid)}</p>
          </div>
          <div className="bg-[#fdfbf7] p-6 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">Pending</p>
            <p className="text-2xl font-semibold text-orange-600">{formatCurrency(kpis.totalPending)}</p>
          </div>
          <div className="bg-[#fdfbf7] p-6 rounded-xl border border-gray-200 text-center">
            <p className="text-sm text-gray-500 mb-1">Scheduled</p>
            <p className="text-2xl font-semibold text-blue-600">{formatCurrency(kpis.totalScheduled)}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-[#C6A664]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            Loading data...
          </div>
        ) : (
          <>
            {viewMode === 'summary' ? (
              <>
                {/* Portfolio Summary */}
                <section className="mb-10">
                  <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Portfolio Summary</h2>
                  {portfolioSummary.length === 0 ? (
                    <p className="text-gray-500">No data available.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {portfolioSummary.map((item, idx) => (
                        <div key={idx} className="bg-[#fdfbf7] p-5 rounded-xl border border-gray-200">
                          <p className="text-sm text-gray-500 mb-1">{item.source_name}</p>
                          <p className="text-2xl font-semibold text-[#0A1E2D]">{formatCurrency(Number(item.expected_amount || 0))}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>

                {/* Charts */}
                <section>
                  <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Global Trends</h2>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={portfolioSummary}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="source_name" />
                      <YAxis tickFormatter={(v) => `$${v}`} />
                      <Tooltip formatter={(v: any) => `$${v}`} />
                      <Legend />
                      <Bar dataKey="expected_amount" fill="#C6A664" name="Expected Amount ($)" />
                      <Bar dataKey="total_payout" fill="#0A1E2D" name="Total Payout ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </section>
              </>
            ) : (
              /* Detailed View */
              <section>
                <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Detailed Payouts by User</h2>
                {payouts.length === 0 ? (
                  <p className="text-gray-500">No payout data available.</p>
                ) : (
                  <div className="space-y-8">
                    {users.map((u) => {
                      const userPayouts = payouts.filter((p) => p.income_sources?.user_id === u.id)
                      if (userPayouts.length === 0) return null
                      return (
                        <div key={u.id} className="border border-gray-200 rounded-xl p-5 bg-[#fdfbf7]">
                          <h3 className="text-lg font-semibold text-[#0A1E2D] mb-3">{u.email}</h3>
                          <table className="w-full text-sm border border-gray-200">
                            <thead className="bg-[#f9f7f3]">
                              <tr>
                                <th className="p-2">Source</th>
                                <th className="p-2">Amount</th>
                                <th className="p-2">Date</th>
                                <th className="p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userPayouts.map((p) => (
                                <tr key={p.id} className="border-t hover:bg-[#fff]">
                                  <td className="p-2">{p.income_sources?.source_name}</td>
                                  <td className="p-2">{formatCurrency(Number(p.amount || 0))}</td>
                                  <td className="p-2">{new Date(p.payout_date).toLocaleDateString()}</td>
                                  <td className="p-2">{p.status}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {/* User Management */}
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">User Management</h2>
              <table className="w-full border border-gray-200 rounded-lg">
                <thead className="bg-[#f9f7f3]">
                  <tr className="text-left">
                    <th className="p-3">Email</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-[#fdfbf7]">
                      <td className="p-3">{u.email}</td>
                      <td className="p-3 capitalize">{u.role}</td>
                      <td className="p-3">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        {u.role === 'admin' ? (
                          <button onClick={() => handleRoleChange(u.id, 'user')} className="text-sm text-red-600 hover:underline">Revoke Admin</button>
                        ) : (
                          <button onClick={() => handleRoleChange(u.id, 'admin')} className="text-sm text-blue-600 hover:underline">Make Admin</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
