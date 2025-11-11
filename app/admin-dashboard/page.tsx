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
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [editItem, setEditItem] = useState<any | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // Verify admin access and set role
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

  // Fetch all admin dashboard data
  const fetchData = async () => {
    try {
      setLoading(true)
      const [usersData, portfolioData, trendsData, payoutData] = await Promise.all([
        supabase.from('users').select('id, email, role, created_at'),
        supabase.from('v_admin_portfolio_summary').select('*'),
        supabase.from('v_admin_monthly_trends').select('*'),
        supabase.from('v_user_payout_summary').select('*')
      ])

      setUsers(usersData.data || [])
      setPortfolioSummary(portfolioData.data || [])
      setMonthlyTrends(trendsData.data || [])
      setPayoutSummary(payoutData.data || [])
    } catch (err) {
      console.error(err)
      setMessage('Error loading admin data.')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value: number) =>
    value?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  // Delete income source
  const handleDelete = async (sourceName: string) => {
    if (!confirm(`Are you sure you want to delete ${sourceName}?`)) return
    const { error } = await supabase.from('user_sources').delete().eq('source_name', sourceName)
    if (error) {
      alert('Error deleting source.')
      console.error(error)
    } else {
      alert(`${sourceName} deleted successfully.`)
      fetchData()
    }
  }

  // Open edit modal
  const handleEdit = (item: any) => {
    setEditItem(item)
    setShowEditModal(true)
  }

  // Save changes
  const handleSaveEdit = async () => {
    if (!editItem) return
    const { source_name, total_payout } = editItem
    const { error } = await supabase
      .from('user_sources')
      .update({ source_name, total_payout })
      .eq('source_name', source_name)
    if (error) {
      alert('Error updating record.')
      console.error(error)
    } else {
      alert('Record updated successfully.')
      setShowEditModal(false)
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
              <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Portfolio Summary</h2>
              {portfolioSummary.length === 0 ? (
                <p className="text-gray-500">No data yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {portfolioSummary.map((item, idx) => (
                    <div key={idx} className="bg-[#fdfbf7] p-5 rounded-xl border border-gray-200 text-center">
                      <p className="text-sm text-gray-500 mb-1">{item.source_name}</p>
                      <p className="text-2xl font-semibold text-[#0A1E2D]">{formatCurrency(Number(item.total_payout || 0))}</p>
                      <div className="mt-2 flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(item.source_name)}
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
                  <BarChart
                    data={portfolioSummary.map((item) => ({
                      source_name: item.source_name,
                      total_payout: Number(item.total_payout || 0)
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="source_name" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <Tooltip formatter={(value: any) => `$${value}`} />
                    <Legend />
                    <Bar dataKey="total_payout" fill="#C6A664" name="Total Payout ($)" />
                  </BarChart>
                </ResponsiveContainer>
              )}
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
            <label className="block mb-2 text-sm text-gray-600">Total Payout</label>
            <input
              type="number"
              value={editItem.total_payout}
              onChange={(e) => setEditItem({ ...editItem, total_payout: e.target.value })}
              className="w-full border rounded-md p-2 mb-6"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
