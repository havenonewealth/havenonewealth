/********************************************************************************************
 * FILE: /app/admin-dashboard/page.tsx
 * DESCRIPTION: Admin Dashboard with CSV export grouped by payment status.
 ********************************************************************************************/

'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts'

const CSVLink = dynamic(() => import('react-csv').then((mod) => mod.CSVLink), { ssr: false })

export default function AdminDashboard() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [users, setUsers] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [summary, setSummary] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [groupedData, setGroupedData] = useState<{ status: string; data: any[] }[]>([])

  useEffect(() => {
    const verifyAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data, error } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (error || !data || data.role !== 'admin') return router.push('/dashboard')
      setUserRole(data.role)
      setAuthorized(true)
      await fetchData()
      setLoading(false)
    }
    verifyAdmin()
  }, [])

  const fetchData = async () => {
    const { data: usersData } = await supabase.from('users').select('id, email, role, created_at')
    const { data: payoutsData } = await supabase
      .from('payouts')
      .select('*, income_sources(source_name), users(email)')
    const { data: summaryData } = await supabase.from('v_admin_portfolio_summary').select('*')

    setUsers(usersData || [])
    setPayouts(payoutsData || [])
    setSummary(summaryData || [])

    const grouped = (payoutsData || []).reduce((acc: any, cur: any) => {
      const group = acc.find((g: any) => g.status === cur.status)
      if (group) group.data.push(cur)
      else acc.push({ status: cur.status, data: [cur] })
      return acc
    }, [])
    setGroupedData(grouped)
  }

  const formatCurrency = (v: number) => v?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  if (!authorized)
    return (
      <main className="flex justify-center items-center min-h-screen text-[#0A1E2D] bg-[#f8f9fa]">
        <p>Verifying access...</p>
      </main>
    )

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655]"
            >
              Back to User View
            </button>
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

        {/* CSV Export Dropdown */}
        <div className="flex justify-end mb-6">
          <div className="relative inline-block">
            <details className="group">
              <summary className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold cursor-pointer hover:bg-[#b59655]">
                Export Data ▾
              </summary>
              <div className="absolute right-0 mt-2 w-48 bg-white border rounded-md shadow-md">
                {groupedData.map((g, i) => (
                  <CSVLink
                    key={i}
                    data={g.data.map((d: any) => ({
                      Source: d.income_sources?.source_name,
                      User: d.users?.email,
                      Amount: d.amount,
                      Status: d.status,
                      Date: d.payout_date
                    }))}
                    filename={`Payouts_${g.status}.csv`}
                    className="block px-4 py-2 text-sm text-[#0A1E2D] hover:bg-[#f9f7f3]"
                  >
                    {`Export ${g.status}`}
                  </CSVLink>
                ))}
                <CSVLink
                  data={payouts.map((d: any) => ({
                    Source: d.income_sources?.source_name,
                    User: d.users?.email,
                    Amount: d.amount,
                    Status: d.status,
                    Date: d.payout_date
                  }))}
                  filename="All_Payouts.csv"
                  className="block px-4 py-2 text-sm text-[#0A1E2D] hover:bg-[#f9f7f3]"
                >
                  Export All
                </CSVLink>
              </div>
            </details>
          </div>
        </div>

        {/* KPI / Charts / Details */}
        <div className="space-y-10">
          <section>
            <h2 className="text-xl font-semibold mb-4">Global Payout Distribution</h2>
            {summary.length === 0 ? (
              <p className="text-gray-500">No data available.</p>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={summary}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="source_name" />
                  <YAxis tickFormatter={(v) => `$${v}`} />
                  <Tooltip formatter={(v) => `$${v}`} />
                  <Legend />
                  <Bar dataKey="expected_amount" fill="#C6A664" name="Expected ($)" />
                  <Bar dataKey="total_payout" fill="#0A1E2D" name="Payouts ($)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </section>
        </div>
      </div>
    </main>
  )
}
