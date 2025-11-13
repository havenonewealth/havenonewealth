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
  const [payoutSummary, setPayoutSummary] = useState<any[]>([])
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([])
  const [portfolioSummary, setPortfolioSummary] = useState<any[]>([])
  const [portfolioAggregates, setPortfolioAggregates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editItem, setEditItem] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newSource, setNewSource] = useState({ source_name: '', expected_amount: '' })

  // Verify admin access
  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !data) {
        router.push('/dashboard')
      } else {
        setUserRole(data.role)
        if (data.role !== 'admin') {
          router.push('/dashboard')
        } else {
          setAuthorized(true)
          await fetchData()
        }
      }
    }
    verifyAdmin()
  }, [router])

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersData, portfolioView, trendsView] = await Promise.all([
        supabase.from('users').select('id, email, role, created_at'),
        supabase.from('v_admin_portfolio_summary').select('*'),
        supabase.from('v_admin_monthly_trends').select('*')
      ]);

      // Set data directly from views
      setUsers(usersData.data || []);
      setPortfolioSummary(portfolioView.data || []);
      setMonthlyTrends(trendsView.data || []);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setMessage('Error loading admin data.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  // Delete income source
  const handleDelete = async (id: string, sourceName: string) => {
    if (!confirm(`Are you sure you want to delete ${sourceName}?`)) return
    
    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(error)
      alert('Error deleting source.')
    } else {
      alert(`${sourceName} deleted successfully.`)
      fetchData()
    }
  }

  // Edit income source
  const handleEdit = (item: any) => {
    setEditItem(item)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    const { id, source_name, expected_amount } = editItem

    if (!id) {
      alert('This record has no valid ID and cannot be edited.')
      return
    }

    const { error } = await supabase
      .from('income_sources')
      .update({ source_name, expected_amount: Number(expected_amount) })
      .eq('id', id)

    if (error) {
      console.error('Supabase update error:', error)
      alert(`Error updating record: ${error.message}`)
    } else {
      alert('Record updated successfully.')
      setShowEditModal(false)
      fetchData()
    }
  }

  // Add new income source
  const handleAddSource = async () => {
    if (!newSource.source_name || !newSource.expected_amount) {
      alert('Please fill in all fields.')
      return
    }

    const { error } = await supabase
      .from('income_sources')
      .insert([{ user_id: null, source_name: newSource.source_name, expected_amount: Number(newSource.expected_amount) }])

    if (error) {
      console.error(error)
      alert('Error adding new source.')
    } else {
      alert('New source added successfully.')
      setShowAddModal(false)
      setNewSource({ source_name: '', expected_amount: '' })
      fetchData()
    }
  }

  // Change user role dynamically
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
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            {userRole === 'admin' && (
              <button
                onClick={() =>
                  router.push(pathname === '/admin-dashboard' ? '/dashboard' : '/admin-dashboard')
                }
                className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
              >
                {pathname === '/admin-dashboard' ? 'Switch to User View' : 'Switch to Admin View'}
              </button>
            )}
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
          <div className="flex justify-center items-center py-20 text-gray-500">
            <svg className="animate-spin h-6 w-6 mr-2 text-[#C6A664]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
            </svg>
            Loading data...
          </div>
        ) : (
          <div className="space-y-10">
            {/* Portfolio Summary */}
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-[#0A1E2D]">Portfolio Summary</h2>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
                >
                  + Add New Source
                </button>
              </div>
              {portfolioSummary.length === 0 ? (
                <p className="text-gray-500">No data yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {portfolioSummary.map((item, idx) => (
                    <div key={idx} className="bg-[#fdfbf7] p-5 rounded-xl border border-gray-200 text-center">
                      <p className="text-sm text-gray-500 mb-1">{item.source_name}</p>
                      <p className="text-2xl font-semibold text-[#0A1E2D]">
                        {formatCurrency(Number(item.expected_amount || 0))}
                      </p>
                      <div className="mt-2 flex justify-center gap-3">
                        <button onClick={() => handleEdit(item)} className="text-sm text-blue-600 hover:underline">
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.source_name)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Global Payout Distribution */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Global Payout Distribution</h2>
              {portfolioSummary.length === 0 ? (
                <p className="text-gray-500">No payout data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={portfolioSummary}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source_name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: any) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="expected_amount" fill="#C6A664" name="Expected Amount ($)" />
                    <Bar dataKey="total_payout" fill="#0A1E2D" name="Total Payout ($)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </section>



            {/* Monthly Trends */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Monthly Trends</h2>
              {monthlyTrends.length === 0 ? (
                <p className="text-gray-500">No monthly data available.</p>
              ) : (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={monthlyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: any) => `$${value}`} />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="total_payout"
                      stroke="#0A1E2D"
                      strokeWidth={2}
                      name="Total Payout ($)"
                    />
                    <Line
                      type="monotone"
                      dataKey="total_payment"
                      stroke="#C6A664"
                      strokeWidth={2}
                      name="Number of Payments"
                      yAxisId={1}
                    />
                  </LineChart>
                </ResponsiveContainer>
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

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Edit Income Source</h3>
            <label className="block mb-2 text-sm text-gray-600">Source Name</label>
            <input
              type="text"
              value={editItem.source_name}
              onChange={(e) => setEditItem({ ...editItem, source_name: e.target.value })}
              className="w-full border rounded-md p-2 mb-4"
            />
            <label className="block mb-2 text-sm text-gray-600">Expected Amount</label>
            <input
              type="number"
              value={editItem.expected_amount}
              onChange={(e) => setEditItem({ ...editItem, expected_amount: e.target.value })}
              className="w-full border rounded-md p-2 mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Add New Income Source</h3>
            <label className="block mb-2 text-sm text-gray-600">Source Name</label>
            <input
              type="text"
              value={newSource.source_name}
              onChange={(e) => setNewSource({ ...newSource, source_name: e.target.value })}
              className="w-full border rounded-md p-2 mb-4"
            />
            <label className="block mb-2 text-sm text-gray-600">Expected Amount</label>
            <input
              type="number"
              value={newSource.expected_amount}
              onChange={(e) => setNewSource({ ...newSource, expected_amount: e.target.value })}
              className="w-full border rounded-md p-2 mb-6"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleAddSource} className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]">
                Add Source
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
