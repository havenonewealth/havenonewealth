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

export default function AdminDashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [globalSummary, setGlobalSummary] = useState<any[]>([])
  const [recentPayouts, setRecentPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editItem, setEditItem] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSource, setNewSource] = useState({ source_name: '', expected_amount: '' })

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !data || data.role !== 'admin') {
        router.push('/dashboard')
      } else {
        setUserRole(data.role)
        setAuthorized(true)
        await fetchData()
      }
    }
    verifyAdmin()
  }, [router])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersData, portfolio, trends, globals, recents] = await Promise.all([
        supabase.from('users').select('id, email, role, created_at'),
        supabase.from('v_admin_portfolio_summary').select('*'),
        supabase.from('v_admin_monthly_trends').select('*'),
        supabase.from('v_admin_global_summary').select('*'),
        supabase.from('v_admin_recent_payouts').select('*')
      ])
      setUsers(usersData.data || [])
      setPortfolioSummary(portfolio.data || [])
      setMonthlyTrends(trends.data || [])
      setGlobalSummary(globals.data || [])
      setRecentPayouts(recents.data || [])
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setMessage('Error loading admin data.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) =>
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  const handleDelete = async (id: string, sourceName: string) => {
    if (!confirm(`Are you sure you want to delete ${sourceName}?`)) return
    const { error } = await supabase.from('income_sources').delete().eq('id', id)
    if (error) alert('Error deleting source.')
    else {
      alert(`${sourceName} deleted successfully.`)
      fetchData()
    }
  }

  const handleEdit = (item: any) => {
    setEditItem(item)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    const { id, source_name, expected_amount } = editItem
    const { error } = await supabase
      .from('income_sources')
      .update({ source_name, expected_amount: Number(expected_amount) })
      .eq('id', id)
    if (error) alert('Error updating record.')
    else {
      alert('Record updated successfully.')
      setShowEditModal(false)
      fetchData()
    }
  }

  const handleAddSource = async () => {
    if (!newSource.source_name || !newSource.expected_amount) {
      alert('Please fill in all fields.')
      return
    }
    const { error } = await supabase
      .from('income_sources')
      .insert([{ user_id: null, source_name: newSource.source_name, expected_amount: Number(newSource.expected_amount) }])
    if (error) alert('Error adding new source.')
    else {
      alert('New source added successfully.')
      setShowAddModal(false)
      setNewSource({ source_name: '', expected_amount: '' })
      fetchData()
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

  if (!authorized) return null

  return (
    <main className="min-h-screen bg-[#f7f8f9] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-2xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button
              onClick={() =>
                router.push(pathname === '/admin-dashboard' ? '/dashboard' : '/admin-dashboard')
              }
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              {pathname === '/admin-dashboard' ? 'Switch to User View' : 'Switch to Admin View'}
            </button>
            <button
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
            >
              Logout
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-6 text-[#0A1E2D]">Admin Dashboard</h1>

        {message && <p className="mb-4 text-sm text-gray-700">{message}</p>}

        {loading ? (
          <p className="text-gray-500 text-center py-20">Loading data...</p>
        ) : (
          <div className="space-y-10">
            {/* Global Overview Cards */}
            {globalSummary.length > 0 && (
              <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {globalSummary.map((item, idx) => (
                  <div key={idx} className="bg-[#fdfbf7] p-6 rounded-xl shadow-sm border border-gray-200 text-center">
                    <p className="text-sm text-gray-500 mb-1">Total Portfolio Value</p>
                    <p className="text-2xl font-semibold text-[#0A1E2D] mb-1">
                      {formatCurrency(Number(item.total_payout_amount || 0))}
                    </p>
                    <p className="text-xs text-gray-600">{item.total_sources} Sources</p>
                    <p className="text-xs text-gray-600">{item.total_payouts} Payouts</p>
                  </div>
                ))}
              </section>
            )}

            {/* Global Payout Distribution */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Global Payout Distribution</h2>
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

            {/* Monthly Trends */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Monthly Trends</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_payout" stroke="#0A1E2D" strokeWidth={2} name="Total Payout ($)" />
                  <Line type="monotone" dataKey="total_payments" stroke="#C6A664" strokeWidth={2} name="Number of Payments" />
                </LineChart>
              </ResponsiveContainer>
            </section>

            {/* Recent Payouts */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Recent Payout Activity</h2>
              {recentPayouts.length === 0 ? (
                <p className="text-gray-500">No recent payouts recorded.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-[#f9f7f3]">
                      <tr className="text-left">
                        <th className="p-3">Source</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentPayouts.map((r) => (
                        <tr key={r.id} className="border-t border-gray-100 hover:bg-[#fdfbf7]">
                          <td className="p-3">{r.source_name}</td>
                          <td className="p-3">{formatCurrency(Number(r.amount))}</td>
                          <td className="p-3">{r.status}</td>
                          <td className="p-3">{new Date(r.payment_date).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* User Management */}
            <section>
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
                          <button
                            onClick={() => handleRoleChange(u.id, 'user')}
                            className="text-sm text-red-600 hover:underline"
                          >
                            Revoke Admin
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRoleChange(u.id, 'admin')}
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </main>
  )
}
