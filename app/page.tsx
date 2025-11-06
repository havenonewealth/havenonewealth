'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const [sources, setSources] = useState<any[]>([])
  const [newSource, setNewSource] = useState({
    source_name: '',
    source_type: '',
    frequency: '',
    expected_amount: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    const { data, error } = await supabase.from('income_sources').select('*')
    if (error) setMessage('Error loading data: ' + error.message)
    else setSources(data)
  }

  const addSource = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('income_sources').insert([newSource])
    if (error) setMessage('Error adding source: ' + error.message)
    else {
      setMessage('✅ Source added successfully!')
      setNewSource({ source_name: '', source_type: '', frequency: '', expected_amount: '' })
      fetchSources()
    }
  }

  return (
    <main style={{ padding: '2rem', fontFamily: 'Lato, sans-serif', color: '#0A1E2D' }}>
      {/* LOGO */}
      <Image
        src="/HOW2Logo.png"
        alt="Haven One Wealth Logo"
        width={160}
        height={60}
        style={{ marginBottom: '1rem' }}
      />

      <h1 style={{ color: '#0A1E2D', marginBottom: '0.5rem' }}>Haven One Wealth Dashboard</h1>
      <p style={{ marginBottom: '2rem', color: '#444' }}>
        Track your royalties, residuals, and income sources.
      </p>

      {/* FORM SECTION */}
      <form
        onSubmit={addSource}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: 400,
          gap: '0.75rem',
          marginBottom: '2rem'
        }}
      >
        <input
          type="text"
          placeholder="Source Name (e.g. Spotify)"
          value={newSource.source_name}
          onChange={(e) => setNewSource({ ...newSource, source_name: e.target.value })}
          required
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Type (Royalty / Residual)"
          value={newSource.source_type}
          onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />

        <input
          type="text"
          placeholder="Frequency (Monthly / Quarterly)"
          value={newSource.frequency}
          onChange={(e) => setNewSource({ ...newSource, frequency: e.target.value })}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />

        <input
          type="number"
          placeholder="Expected Amount"
          value={newSource.expected_amount}
          onChange={(e) => setNewSource({ ...newSource, expected_amount: e.target.value })}
          style={{
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid #ccc',
            fontSize: '14px'
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: '#C6A664',
            color: '#0A1E2D',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 20px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Add Source
        </button>
      </form>

      {message && <p>{message}</p>}

      {/* INCOME SOURCE LIST */}
      <h2>Your Income Sources</h2>
      <ul>
        {sources.map((src) => (
          <li key={src.id}>
            <strong>{src.source_name}</strong> — {src.source_type} — {src.frequency} — ${src.expected_amount}
          </li>
        ))}
      </ul>
    </main>
  )
}
