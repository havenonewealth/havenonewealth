'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import KPI from '@/components/KPI'
import Charts from '@/components/Charts'
import { formatCurrency } from '@/lib/utils/formatCurrency'

const CSVLink = dynamic(() => import('react-csv').then((m) => m.CSVLink), { ssr: false })

export default function AdminDashboard() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [kpis, setKpis] = useState({ expected: 0, paid: 0, pending: 0, scheduled: 0 })
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      if (data?.role !== 'admin') return router.push('/dashboard')
      setAuthorized(true)
      const [us, po] = await Promise.all([
        supabase.from('users').select('*'),
        supabase.from('payouts').select('*, income_sources(source_name, user_id)')
      ])
      setUsers(us.data || [])
      const payoutsData = po.data || []
      setPayouts(payoutsData)

      const paid = payoutsData.filter(p => p.status === 'Paid').reduce((a, b) => a + (b.amount || 0), 0)
      const pending = payoutsData.filter(p => p.status === 'Pending').reduce((a, b) => a + (b.amount || 0), 0)
      const scheduled = payoutsData.filter(p => p.status === 'Scheduled').reduce((a, b) => a + (b.amount || 0), 0)

      setKpis({
        expected: paid + pending + scheduled,
        paid,
        pending,
        scheduled
      })

    })()
  }, [router])

  if (!authorized) return null

  const exportData = payouts.map(p => ({
    User: users.find(u => u.id === p.income_sources?.user_id)?.email || '',
    Source: p.income_sources?.source_name || '',
    Amount: formatCurrency(p.amount),
    Status: p.status,
    Date: p.payment_date
  }))

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-7xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md hover:bg-[#b59655]">Back to User View</button>
            <CSVLink data={exportData} filename="HavenOne-Payouts.csv" className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664]">Export CSV</CSVLink>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <KPI label="Expected" value={formatCurrency(kpis.expected)} />
          <KPI label="Paid" value={formatCurrency(kpis.paid)} />
          <KPI label="Pending" value={formatCurrency(kpis.pending)} />
          <KPI label="Scheduled" value={formatCurrency(kpis.scheduled)} />
        </div>
        <Charts data={payouts} />
      </div>
    </main>
  )
}
