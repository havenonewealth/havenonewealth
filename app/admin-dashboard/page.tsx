'use client'

import { useEffect, useState } from 'react'
import HavenOneLayout from '@/components/HavenOneLayout'
import { supabase } from '@/lib/supabaseClient'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, LineChart, Line } from 'recharts'

export default function AdminDashboard() {
  const [portfolio, setPortfolio] = useState<any[]>([])
  const [monthly, setMonthly] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [portfolioData, trendsData, usersData] = await Promise.all([
        supabase.from('v_admin_portfolio_summary').select('*'),
        supabase.from('v_admin_monthly_trends').select('*'),
        supabase.from('users').select('id, email, role, created_at')
      ])
      setPortfolio(portfolioData.data || [])
      setMonthly(trendsData.data || [])
      setUsers(usersData.data || [])
    } catch (err) {
      console.error(err)
      setMessage('Error loading admin dashboard.')
    } finally {
      setLoading(false)
    }
  }

  const totalPortfolio = portfolio.reduce((sum, s) => sum + (s.expected_amount || 0), 0)
  const totalPaid = portfolio.reduce((sum, s) => sum + (s.total_payout || 0), 0)
  const totalUsers = users.length

  const formatCurrency = (v: number) => v?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <HavenOneLayout title="Admin Dashboard">
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="space-y-12">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Portfolio Value</p>
              <p className="text-3xl font-semibold text-[#0A1E2D]">{formatCurrency(totalPortfolio)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Payouts</p>
              <p className="text-3xl font-semibold text-[#C6A664]">{formatCurrency(totalPaid)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <p className="text-gray-500 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-semibold text-[#0A1E2D]">{totalUsers}</p>
            </div>
          </div>

          {/* Portfolio Distribution */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Portfolio Distribution</h2>
            {portfolio.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={portfolio}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source_name" />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v: any) => `$${v}`} />
                  <Legend />
                  <Bar dataKey="expected_amount" fill="#C6A664" name="Expected ($)" />
                  <Bar dataKey="total_payout" fill="#0A1E2D" name="Paid ($)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>

          {/* Monthly Trends */}
          <section>
            <h2 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Monthly Trends</h2>
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
                </LineChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>
      )}
    </HavenOneLayout>
  )
}
