'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface Summary {
  total_expected: number
  total_received: number
  upcoming_payments: number
  payout_count: number
  source_count: number
}

export default function DashboardHome() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: sources } = await supabase
        .from('income_sources')
        .select('expected_amount')
        .eq('user_id', user.id)

      const totalExpected = sources?.reduce(
        (acc, s) => acc + (Number(s.expected_amount) || 0),
        0
      ) || 0

      const { data: payouts } = await supabase
        .from('payouts')
        .select('amount, payment_date, status')
        .eq('user_id', user.id)

      const totalReceived = payouts
        ?.filter(p => p.status === 'Paid')
        .reduce((acc, p) => acc + Number(p.amount), 0) || 0

      const upcoming = payouts
        ?.filter(p => p.status !== 'Paid')
        .length || 0

      setSummary({
        total_expected: totalExpected,
        total_received: totalReceived,
        upcoming_payments: upcoming,
        payout_count: payouts?.length || 0,
        source_count: sources?.length || 0,
      })

      setLoading(false)
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="text-center p-10">Loading overview…</div>
    )
  }

  if (!summary) return null

  return (
    <div>

      {/* Title */}
      <h1 className="text-3xl font-semibold mb-8">Overview</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <div className="text-gray-500 text-sm mb-1">Total Expected Value</div>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_expected)}</div>
        </div>

        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <div className="text-gray-500 text-sm mb-1">Total Paid Out</div>
          <div className="text-2xl font-bold">{formatCurrency(summary.total_received)}</div>
        </div>

        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <div className="text-gray-500 text-sm mb-1">Upcoming Payments</div>
          <div className="text-2xl font-bold">{summary.upcoming_payments}</div>
        </div>

      </div>

      {/* Lower grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Sources</h2>
          <p className="text-3xl font-bold">{summary.source_count}</p>
        </div>

        <div className="p-6 rounded-xl border shadow-sm bg-white">
          <h2 className="text-xl font-semibold mb-4">Total Payout Records</h2>
          <p className="text-3xl font-bold">{summary.payout_count}</p>
        </div>

      </div>

    </div>
  )
}
