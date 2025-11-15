'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface PayoutsSectionProps {
  userId: string
  isAdmin?: boolean
}

export default function PayoutsSection({ userId, isAdmin = false }: PayoutsSectionProps) {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPayouts()
  }, [userId, isAdmin])

  const fetchPayouts = async () => {
    setLoading(true)
    const query = supabase.from('payouts').select('*')
    const { data, error } = isAdmin ? await query : await query.eq('user_id', userId)
    if (!error && data) setPayouts(data)
    setLoading(false)
  }

  if (loading) return <p>Loading payouts...</p>
  if (!payouts.length) return <p>No payouts found.</p>

  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold mb-4">{isAdmin ? 'All Payouts' : 'Your Payouts'}</h2>
      <table className="w-full border border-gray-200 rounded-lg text-sm">
        <thead className="bg-[#f9f7f3]">
          <tr className="text-left">
            <th className="p-3">Date</th>
            <th className="p-3">Source</th>
            <th className="p-3">Amount</th>
            <th className="p-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((p) => (
            <tr key={p.id} className="border-t border-gray-100 hover:bg-[#fdfbf7]">
              <td className="p-3">{new Date(p.payout_date).toLocaleDateString()}</td>
              <td className="p-3">{p.source_name}</td>
              <td className="p-3">${p.amount?.toLocaleString()}</td>
              <td className="p-3 capitalize">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
