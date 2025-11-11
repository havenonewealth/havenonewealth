'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestSupabase() {
  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from('v_admin_portfolio_summary')
        .select('*')

      console.log('Supabase data:', data)
      console.log('Error:', error)
    }
    fetchData()
  }, [])

  return (
    <main className="p-10">
      <h1 className="text-xl font-semibold">Check your browser console (F12 → Console)</h1>
      <p>We are testing data from <strong>v_admin_portfolio_summary</strong>.</p>
    </main>
  )
}
