'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import PayoutsSection from '@/components/PayoutsSection'

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase.from('users').select('role').eq('id', user.id).single()
      setRole(data?.role)
      setLoading(false)
    }
    init()
  }, [])

  if (loading) return <p>Loading admin dashboard...</p>
  if (role !== 'admin') return <p>Unauthorized</p>

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold mb-6">Admin Dashboard</h1>
      <PayoutsSection userId={''} isAdmin={true} />
    </main>
  )
}
