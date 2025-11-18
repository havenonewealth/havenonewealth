'use client'

import { useEffect, useState } from 'react'
import { getPayouts, Payout } from '@/lib/supabase/payouts'
import PayoutsTable from '@/components/payouts/PayoutsTable'

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const data = await getPayouts()
      setPayouts(data || [])
      setLoading(false)
    }

    load()
  }, [])

  if (loading) {
    return <div className="p-10">Loading payouts...</div>
  }

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Payouts</h1>
      <PayoutsTable payouts={payouts} />
    </div>
  )
}
