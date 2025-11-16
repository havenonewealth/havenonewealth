'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Tabs from '@/components/Tabs'
import KPI from '@/components/KPI'
import Charts from '@/components/Charts'
import { formatCurrency } from '@/lib/utils/formatCurrency'
import type { IncomeSource, Payout } from '@/lib/types'

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sources' | 'payouts' | 'analytics'>('sources')
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      setUser(user)
      const { data: src } = await supabase.from('income_sources').select('*').eq('user_id', user.id)
      const { data: pay } = await supabase.from('payouts').select('*, income_sources(source_name)').eq('user_id', user.id)
      setSources(src || [])
      setPayouts(pay || [])
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) return <main className="flex items-center justify-center h-screen text-gray-600">Loading...</main>

  const paid = payouts.filter(p => p.status === 'Paid').reduce((a, b) => a + (b.amount || 0), 0)
  const pending = payouts.filter(p => p.status === 'Pending').reduce((a, b) => a + (b.amount || 0), 0)
  const scheduled = payouts.filter(p => p.status === 'Scheduled').reduce((a, b) => a + (b.amount || 0), 0)

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth" width={160} height={60} />
          <button onClick={() => router.push('/admin-dashboard')} className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition">Admin</button>
        </div>

        <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'sources' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Income Sources</h2>
            {sources.length === 0 ? <p>No income sources found.</p> :
              <ul className="space-y-3">
                {sources.map((s) => (
                  <li key={s.id} className="border p-4 rounded-md shadow-sm flex justify-between">
                    <div>
                      <p className="font-semibold">{s.source_name}</p>
                      <p className="text-sm text-gray-500">{formatCurrency(s.expected_amount || 0)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            }
          </div>
        )}

        {activeTab === 'payouts' && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Payouts</h2>
            {payouts.length === 0 ? <p>No payouts found.</p> :
              <table className="w-full border border-gray-200 text-sm">
                <thead className="bg-[#f9f7f3]">
                  <tr><th className="p-2 text-left">Source</th><th className="p-2">Amount</th><th className="p-2">Date</th><th className="p-2">Status</th></tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={p.id} className="border-t hover:bg-[#fdfbf7]">
                      <td className="p-2">{p.income_sources?.source_name || '—'}</td>
                      <td className="p-2 text-right">{formatCurrency(p.amount)}</td>
                      <td className="p-2">{p.payment_date}</td>
                      <td className="p-2">{p.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            }
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <KPI label="Total Paid" value={formatCurrency(paid)} />
              <KPI label="Pending" value={formatCurrency(pending)} />
              <KPI label="Scheduled" value={formatCurrency(scheduled)} />
            </div>
            <Charts data={payouts} />
          </div>
        )}
      </div>
    </main>
  )
}
