'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { logError } from '@/app/utils/logger'
import PayoutsSection from '@/components/PayoutsSection'

export default function Dashboard() {
  const router = useRouter()
  const pathname = usePathname()
  const [sources, setSources] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [newSource, setNewSource] = useState({
    source_name: '',
    source_type: '',
    frequency: '',
    expected_amount: ''
  })
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Check session and fetch data
  useEffect(() => {
    const init = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return router.push('/login')

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return router.push('/login')
        setUser(user)

        const { data: roleData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single()
        setUserRole(roleData?.role || null)

        await fetchSources(user.id)
      } catch (err) {
        await logError('dashboard-init', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [router])

  const fetchSources = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('income_sources')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (error) throw error
      setSources(data || [])
    } catch (err) {
      await logError('dashboard-fetch-sources', err)
    }
  }

  const addSource = async (e: any) => {
    e.preventDefault()
    try {
      if (!user) return
      const { error } = await supabase.from('income_sources').insert([
        { ...newSource, user_id: user.id }
      ])
      if (error) throw error
      setMessage('Source added successfully.')
      setNewSource({ source_name: '', source_type: '', frequency: '', expected_amount: '' })
      fetchSources(user.id)
    } catch (err) {
      await logError('dashboard-add-source', err)
      setMessage('Error adding source.')
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      await logError('dashboard-logout', err)
    }
  }

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-[#C6A664]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
          </svg>
          <p>Loading your dashboard...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button onClick={() => router.push('/analytics')} className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655]">Analytics</button>
            {userRole === 'admin' && (
              <button
                onClick={() => router.push(pathname === '/dashboard' ? '/admin-dashboard' : '/dashboard')}
                className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655]"
              >
                {pathname === '/dashboard' ? 'Switch to Admin View' : 'Switch to User View'}
              </button>
            )}
            <button onClick={handleLogout} className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664]">Logout</button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Haven One Wealth Dashboard</h1>
        <p className="text-gray-600 mb-8 text-[15px]">Track your royalties, residuals, and income sources securely.</p>

        {/* Add Source Form */}
        <form onSubmit={addSource} className="flex flex-col gap-3 max-w-md mb-10">
          <input type="text" placeholder="Source Name (e.g. Netflix)" value={newSource.source_name} onChange={(e) => setNewSource({ ...newSource, source_name: e.target.value })} required className="p-2 border border-gray-300 rounded-md" />
          <input type="text" placeholder="Type (Royalty / Residual)" value={newSource.source_type} onChange={(e) => setNewSource({ ...newSource, source_type: e.target.value })} className="p-2 border border-gray-300 rounded-md" />
          <input type="text" placeholder="Frequency (Monthly / Quarterly)" value={newSource.frequency} onChange={(e) => setNewSource({ ...newSource, frequency: e.target.value })} className="p-2 border border-gray-300 rounded-md" />
          <input type="number" placeholder="Expected Amount" value={newSource.expected_amount} onChange={(e) => setNewSource({ ...newSource, expected_amount: e.target.value })} className="p-2 border border-gray-300 rounded-md" />
          <button type="submit" className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655]">Add Source</button>
        </form>

        {message && <p className="text-sm text-gray-700 mb-6">{message}</p>}

        {/* Income Source List */}
        <h2 className="text-xl font-semibold mb-3 text-[#0A1E2D]">Your Income Sources</h2>
        {sources.length === 0 ? (
          <p className="text-gray-500">No income sources added yet.</p>
        ) : (
          <div className="space-y-6">
            {sources.map((src) => (
              <div key={src.id} className="border border-gray-200 p-5 rounded-xl shadow-sm bg-[#fdfbf7] hover:shadow-md transition">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="text-lg font-semibold text-[#0A1E2D]">{src.source_name}</p>
                    <p className="text-sm text-gray-600">{src.source_type} • {src.frequency} • ${src.expected_amount}</p>
                  </div>
                </div>
                <PayoutsSection sourceId={src.id} userId={user.id} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
