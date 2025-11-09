'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { logError } from '@/app/utils/logger'

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
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  // Redirect unauthenticated users
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) router.push('/login')
        else await fetchData()
      } catch (err) {
        await logError('payouts-auth-check', err)
      }
    }
    checkUser()
  }, [router])

  // Fetch income sources and payouts for the logged-in user
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      let sourcesData: any[] = []
      let payoutsData: any[] = []

      // Fetch income sources
      try {
        const { data, error } = await supabase
          .from('income_sources')
          .select('id, source_name')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        if (error) throw error
        sourcesData = data || []
      } catch (err) {
        await logError('payouts-fetch-sources', err)
      }

      // Fetch payouts
      try {
        const { data, error } = await supabase
          .from('payouts')
          .select('id, amount, payment_date, status, attachment_url, source_id, user_id')
          .eq('user_id', user.id)
          .order('payment_date', { ascending: false })
        if (error) throw error
        payoutsData = data || []
      } catch (err) {
        await logError('payouts-fetch-payouts', err)
      }

      setSources(sourcesData)
      setPayouts(payoutsData)
      setLoading(false)
    } catch (err) {
      setMessage('Error loading payouts data.')
      await logError('payouts-fetch-data', err)
      setLoading(false)
    }
  }

  // Upload attachment to Supabase Storage
  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !file) return null

      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('payout-attachments')
        .upload(filePath, file, { upsert: false })

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from('payout-attachments')
        .getPublicUrl(filePath)

      setMessage('✅ File uploaded successfully!')
      return publicUrl.publicUrl
    } catch (err) {
      setMessage('Error uploading file.')
      await logError('payouts-file-upload', err)
      return null
    } finally {
      setUploading(false)
    }
  }

  // Add a new payout
  const addPayout = async (e: any) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setMessage('You must be logged in to add a payout.')
        return
      }

      const newEntry = {
        ...newPayout,
        user_id: user.id,
        amount: parseFloat(newPayout.amount)
      }

      const { error } = await supabase.from('payouts').insert([newEntry])
      if (error) throw error

      setMessage('✅ Payout added successfully!')
      setNewPayout({ source_id: '', amount: '', payment_date: '', status: '', attachment_url: '' })
      await fetchData()
    } catch (err) {
      setMessage('Error adding payout.')
      await logError('payouts-insert', err)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (err) {
      await logError('payouts-logout', err)
    }
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

          {/* File Upload */}
          <div className="flex flex-col gap-2">
            <label className="text-sm text-gray-700 font-medium">Attach File (optional)</label>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const url = await handleFileUpload(file)
                if (url) setNewPayout({ ...newPayout, attachment_url: url })
              }}
              className="p-2 border border-gray-300 rounded-md cursor-pointer bg-[#fafafa]"
            />
            {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
          </div>

          <button
            type="submit"
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655] disabled:opacity-50"
            disabled={uploading}
          >
            {uploading ? 'Please wait...' : 'Add Payout'}
          </button>
        </form>

        {message && <p className="mb-6 text-sm text-gray-700">{message}</p>}

        {/* Payouts List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-600">
            <svg
              className="animate-spin h-8 w-8 text-[#C6A664] mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
              ></path>
            </svg>
            <p>Loading payouts...</p>
          </div>
        ) : payouts.length === 0 ? (
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
