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
  const [fileName, setFileName] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filePreview, setFilePreview] = useState<string | null>(null)

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

  // Fetch income sources and payouts
  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }

      const { data: sourcesData } = await supabase
        .from('income_sources')
        .select('id, source_name')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      const { data: payoutsData } = await supabase
        .from('payouts')
        .select('id, amount, payment_date, status, attachment_url, source_id, user_id')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false })

      setSources(sourcesData || [])
      setPayouts(payoutsData || [])
    } catch (err) {
      await logError('payouts-fetch-data', err)
      setMessage('Error loading payouts data.')
    } finally {
      setLoading(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async (file: File) => {
    try {
      if (!file) return null
      const allowed = ['application/pdf', 'image/png', 'image/jpeg']
      if (!allowed.includes(file.type)) {
        setMessage('Invalid file type. Upload PDF or image only.')
        return null
      }

      setUploading(true)
      setFileName(file.name)
      setUploadProgress(0)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const filePath = `${user.id}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('payout-attachments')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from('payout-attachments')
        .getPublicUrl(filePath)

      // Display preview if image
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setFilePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else {
        setFilePreview(null)
      }

      setUploadProgress(100)
      return publicUrl.publicUrl
    } catch (err) {
      await logError('payouts-file-upload', err)
      setMessage('Error uploading file.')
      return null
    } finally {
      setUploading(false)
    }
  }

  // Add payout record
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
      setFileName('')
      setFilePreview(null)
      setUploadProgress(0)
      await fetchData()
    } catch (err) {
      await logError('payouts-insert', err)
      setMessage('Error adding payout.')
    }
  }

  // Delete payout and cleanup storage
  const deletePayout = async (id: string, attachmentUrl?: string) => {
    try {
      if (!confirm('Are you sure you want to delete this payout?')) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Remove file from storage if exists
      if (attachmentUrl) {
        const path = attachmentUrl.split('/payout-attachments/')[1]
        if (path) {
          await supabase.storage.from('payout-attachments').remove([path])
        }
      }

      const { error } = await supabase.from('payouts').delete().eq('id', id).eq('user_id', user.id)
      if (error) throw error

      setMessage('Payout deleted successfully.')
      await fetchData()
    } catch (err) {
      await logError('payouts-delete', err)
      setMessage('Error deleting payout.')
    }
  }

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
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const url = await handleFileUpload(file)
                if (url) setNewPayout({ ...newPayout, attachment_url: url })
              }}
              className="p-2 border border-gray-300 rounded-md"
            />
            {fileName && <p className="text-sm text-gray-600">File: {fileName}</p>}
            {filePreview && (
              <img
                src={filePreview}
                alt="Preview"
                className="w-32 h-32 object-cover rounded-md border border-gray-200"
              />
            )}
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-[#C6A664] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            )}
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
            <svg className="animate-spin h-8 w-8 text-[#C6A664] mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"></path>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold">{src ? src.source_name : 'Unknown Source'}</p>
                      <p className="text-sm text-gray-600">${p.amount} • {p.status} • {p.payment_date}</p>
                      {p.attachment_url && (
                        <a href={p.attachment_url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 underline">
                          View Attachment
                        </a>
                      )}
                    </div>
                    <button
                      onClick={() => deletePayout(p.id, p.attachment_url)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </main>
  )
}
