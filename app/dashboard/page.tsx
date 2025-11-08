'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function Dashboard() {
  const router = useRouter()
  const [sources, setSources] = useState<any[]>([])
  const [newSource, setNewSource] = useState({
    source_name: '',
    source_type: '',
    frequency: '',
    expected_amount: ''
  })
  const [message, setMessage] = useState('')

  // Verify authentication before showing dashboard
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
    }
    checkUser()
  }, [router])

  // Fetch data only for the current logged-in user
  const fetchSources = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    if (error) setMessage('Error loading data: ' + error.message)
    else setSources(data)
  }

  useEffect(() => {
    fetchSources()
  }, [])

  // Add new record tied to current user
  const addSource = async (e: any) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('You must be logged in to add a source.')
      return
    }

    const { error } = await supabase.from('income_sources').insert([
      {
        ...newSource,
        user_id: user.id
      }
    ])

    if (error) setMessage('Error adding source: ' + error.message)
    else {
      setMessage('✅ Source added successfully!')
      setNewSource({ source_name: '', source_type: '', frequency: '', expected_amount: '' })
      fetchSources()
    }
  }

  // Logout handler
  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">

        {/* Logo & Header Row */}
       <div className="flex justify-between items-center mb-4">
        <Image
          src="/HOW2Logo.png"
          alt="Haven One Wealth Logo"
          width={160}
          height={60}
        />
        <div className="flex gap-3">
          <button
            onClick={() => router.push('/payouts')}
            className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
          >
            Payouts
          </button>
          <button
            onClick={() => router.push('/analytics')}
            className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
          >
            Analytics
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
          >
            Logout
          </button>
        </div>
      </div>

        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Haven One Wealth Dashboard</h1>
        <p className="text-gray-600 mb-8 text-[15px]">
          Track your royalties, residuals, and income sources securely.
        </p>

        {/* Add Source Form */}
        <form onSubmit={addSource} className="flex flex-col gap-3 max-w-md mb-10">
          <input
            type="text"
            placeholder="Source Name (e.g. Spotify)"
            value={newSource.source_name}
            onChange={(e) => setNewSource({ ...newSource, source_name: e.target.value })}
            required
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Type (Royalty / Residual)"
            value={newSource.source_type}
            onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })}
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="text"
            placeholder="Frequency (Monthly / Quarterly)"
            value={newSource.frequency}
            onChange={(e) => setNewSource({ ...newSource, frequency: e.target.value })}
            className="p-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            placeholder="Expected Amount"
            value={newSource.expected_amount}
            onChange={(e) => setNewSource({ ...newSource, expected_amount: e.target.value })}
            className="p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655]"
          >
            Add Source
          </button>
        </form>

        {message && <p className="mb-6 text-sm text-gray-700">{message}</p>}

        {/* Income Source List */}
        <h2 className="text-xl font-semibold mb-3 text-[#0A1E2D]">Your Income Sources</h2>

        {sources.length === 0 ? (
          <p className="text-gray-500">No income sources added yet.</p>
        ) : (
          <ul className="space-y-3">
            {sources.map((src) => (
              <li
                key={src.id}
                className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <p className="text-lg font-semibold">{src.source_name}</p>
                <p className="text-sm text-gray-600">
                  {src.source_type} • {src.frequency} • ${src.expected_amount}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
