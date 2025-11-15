'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PayoutsSection from '@/components/PayoutsSection'

export default function Dashboard() {
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) setUserId(user.id)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <p>Loading dashboard...</p>

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">User Dashboard</h1>
      <PayoutsSection userId={userId || ''} />
    </main>
  )
}
