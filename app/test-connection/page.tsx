'use client'
import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function TestConnection() {
  const [status, setStatus] = useState('Checking connection...')

  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.from('income_sources').select('*').limit(1)
      if (error) setStatus('❌ Connection failed: ' + error.message)
      else setStatus('✅ Connected to Supabase successfully')
    }
    checkConnection()
  }, [])

  return (
    <main style={{ padding: '2rem', fontFamily: 'Lato, sans-serif' }}>
      <h2>Supabase Connection Test</h2>
      <p>{status}</p>
    </main>
  )
}
