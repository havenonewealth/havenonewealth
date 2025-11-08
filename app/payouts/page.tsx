'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function PayoutsPage() {
  const router = useRouter()
  const [sources, setSources] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [newPayout, setNewPayout] = useState({
    source_id: '',
    amount: '',
    payment_date: '',
    status: '',
    attachment_url: ''
  })
  const [message, setMessage] = useState('')

  // Redirect unauthenticated users
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
    }
    checkUser()
  }, [router])

  // Fetch income sources for dropdown + existing payouts
  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: sourcesData } = await supabase
      .from('income_sources')
      .select('id, source_name')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    const { data: payoutsData } = await supabase
      .from('payouts')
      .select('id, amount, payment_date, status, attachment_url, source_id')
      .order('payment_date', { ascending: false })

    setSources(sourcesData || [])
    setPayouts(payoutsData || [])
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Add new payout
  const addPayout = async (e: any) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('You must be logged in to add a payout.')
      return
    }

    const { error } = await supabase.from('payouts').insert([
      {
        ...newPayout,
        amount: parseFloat(newPayout.amount),
      }
    ])

    if (error) setMessage('Error adding payout: ' + error.message)
    else {
      setMessage('✅ Payout added successfully!')
      setNewPayout({ source_id: '', amount: '', payment_date: '', status: '', attachment_url: '' })
      fetchData()
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

        {/* Header Row */}
        <div className="flex justify-between items-center mb-4">
        <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
        <div className="flex gap-3">
            <button
            onClick={() => router.push('/dashboard')}
            className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
            Dashboard
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


        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Payouts</h1>
        <p className="text-gray-600 mb-8 text-[15px]">
          Record and track all royalty and residual payouts tied to your income sources.
        </p>

        {/* Add Payout Form */}
        <form onSubmit={addPayout} className="flex flex-col gap-3 max-w-md mb-10">
          <select
            value={newPayout.source_id}
            onChange={(e) => setNewPayout({ ...newPayout, source_id: e.target.value })}
            required
            className="p-2 border border-gray-300 rounded-md"
          >
            <option value="">Select Income Source</option>
            {sources.map((src) => (
              <option key={src.id} value={src.id}>{src.source_name}</option>
            ))}
          </select>

          <input
            type="number"
            placeholder="Amount"
            value={newPayout.amount}
            onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })}
            required
            className="p-2 border border-gray-300 rounded-md"
          />

          <input
            type="date"
            placeholder="Payment Date"
            value={newPayout.payment_date}
            onChange={(e) => setNewPayout({ ...newPayout, payment_date: e.target.value })}
            required
            className="p-2 border border-gray-300 rounded-md"
          />

          <input
            type="text"
            placeholder="Status (e.g. Paid / Pending)"
            value={newPayout.status}
            onChange={(e) => setNewPayout({ ...newPayout, status: e.target.value })}
            className="p-2 border border-gray-300 rounded-md"
          />

          <input
            type="url"
            placeholder="Attachment URL (optional)"
            value={newPayout.attachment_url}
            onChange={(e) => setNewPayout({ ...newPayout, attachment_url: e.target.value })}
            className="p-2 border border-gray-300 rounded-md"
          />

          <button
            type="submit"
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655]"
          >
            Add Payout
          </button>
        </form>

        {message && <p className="mb-6 text-sm text-gray-700">{message}</p>}

        {/* Payouts List */}
        <h2 className="text-xl font-semibold mb-3 text-[#0A1E2D]">Your Payouts</h2>

        {payouts.length === 0 ? (
          <p className="text-gray-500">No payouts recorded yet.</p>
        ) : (
          <ul className="space-y-3">
            {payouts.map((p) => {
              const src = sources.find((s) => s.id === p.source_id)
              return (
                <li key={p.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <p className="text-lg font-semibold">
                    {src ? src.source_name : 'Unknown Source'}
                  </p>
                  <p className="text-sm text-gray-600">
                    ${p.amount} • {p.status} • {p.payment_date}
                  </p>
                  {p.attachment_url && (
                    <a
                      href={p.attachment_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 underline"
                    >
                      View Attachment
                    </a>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
