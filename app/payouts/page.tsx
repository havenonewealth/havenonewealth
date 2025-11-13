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
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [fileType, setFileType] = useState<string | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editItem, setEditItem] = useState<any | null>(null)
  const [editFile, setEditFile] = useState<File | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

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

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
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
      await logError('payouts-fetch', err)
      setMessage('Error loading payouts.')
    } finally {
      setLoading(false)
    }
  }

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
      setFileType(file.type)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const filePath = `${user.id}/${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage
        .from('payout-attachments')
        .upload(filePath, file, { cacheControl: '3600', upsert: false })
      if (uploadError) throw uploadError

      const { data: publicUrl } = supabase.storage
        .from('payout-attachments')
        .getPublicUrl(filePath)

      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onloadend = () => setFilePreview(reader.result as string)
        reader.readAsDataURL(file)
      } else if (file.type === 'application/pdf') {
        const localUrl = URL.createObjectURL(file)
        setFilePreview(localUrl)
      }
      return publicUrl.publicUrl
    } catch (err) {
      await logError('payouts-upload', err)
      setMessage('Error uploading file.')
      return null
    } finally {
      setUploading(false)
    }
  }

  const addPayout = async (e: any) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const newEntry = {
        ...newPayout,
        user_id: user.id,
        amount: parseFloat(newPayout.amount)
      }
      const { error } = await supabase.from('payouts').insert([newEntry])
      if (error) throw error
      alert('Payout added successfully!')
      setNewPayout({ source_id: '', amount: '', payment_date: '', status: '', attachment_url: '' })
      setFileName('')
      setFilePreview(null)
      setFileType(null)
      await fetchData()
    } catch (err) {
      await logError('payouts-insert', err)
      setMessage('Error adding payout.')
    }
  }

  const handleEdit = (item: any) => {
    setEditItem(item)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    try {
      let attachmentUrl = editItem.attachment_url
      if (editFile) {
        const uploaded = await handleFileUpload(editFile)
        if (uploaded) attachmentUrl = uploaded
      }
      const { error } = await supabase
        .from('payouts')
        .update({
          amount: parseFloat(editItem.amount),
          payment_date: editItem.payment_date,
          status: editItem.status,
          attachment_url: attachmentUrl
        })
        .eq('id', editItem.id)
      if (error) throw error
      alert('Payout updated successfully.')
      setShowEditModal(false)
      setEditFile(null)
      await fetchData()
    } catch (err) {
      await logError('payouts-edit', err)
      alert('Error updating payout.')
    }
  }

  const openDeleteModal = (payout: any) => {
    setDeleteTarget(payout)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    try {
      if (!deleteTarget) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (deleteTarget.attachment_url) {
        const path = deleteTarget.attachment_url.split('/payout-attachments/')[1]
        if (path) await supabase.storage.from('payout-attachments').remove([path])
      }
      const { error } = await supabase
        .from('payouts')
        .delete()
        .eq('id', deleteTarget.id)
        .eq('user_id', user.id)
      if (error) throw error
      alert('Payout deleted successfully.')
      setShowDeleteModal(false)
      await fetchData()
    } catch (err) {
      await logError('payouts-delete', err)
      alert('Error deleting payout.')
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-5xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button onClick={() => router.push('/dashboard')} className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md hover:bg-[#b59655]">Dashboard</button>
            <button onClick={() => router.push('/analytics')} className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md hover:bg-[#b59655]">Analytics</button>
            <button onClick={handleLogout} className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664]">Logout</button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Payouts</h1>
        <p className="text-gray-600 mb-8 text-[15px]">Record, track, and update royalty and residual payouts.</p>

        <form onSubmit={addPayout} className="flex flex-col gap-3 max-w-md mb-10">
          <select value={newPayout.source_id} onChange={(e) => setNewPayout({ ...newPayout, source_id: e.target.value })} required className="p-2 border border-gray-300 rounded-md">
            <option value="">Select Income Source</option>
            {sources.map((src) => (
              <option key={src.id} value={src.id}>{src.source_name}</option>
            ))}
          </select>
          <input type="number" placeholder="Amount" value={newPayout.amount} onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })} required className="p-2 border border-gray-300 rounded-md" />
          <input type="date" value={newPayout.payment_date} onChange={(e) => setNewPayout({ ...newPayout, payment_date: e.target.value })} required className="p-2 border border-gray-300 rounded-md" />
          <input type="text" placeholder="Status (Paid / Pending)" value={newPayout.status} onChange={(e) => setNewPayout({ ...newPayout, status: e.target.value })} className="p-2 border border-gray-300 rounded-md" />
          <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={async (e) => {
            const file = e.target.files?.[0]
            if (file) {
              const url = await handleFileUpload(file)
              if (url) setNewPayout({ ...newPayout, attachment_url: url })
            }
          }} className="p-2 border border-gray-300 rounded-md" />
          <button type="submit" disabled={uploading} className="bg-[#C6A664] text-[#0A1E2D] py-2 rounded-md font-semibold hover:bg-[#b59655]">{uploading ? 'Uploading...' : 'Add Payout'}</button>
        </form>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
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
                        <a href={p.attachment_url} target="_blank" className="text-sm text-blue-600 underline">View Attachment</a>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(p)} className="text-blue-600 text-sm hover:underline">Edit</button>
                      <button onClick={() => openDeleteModal(p)} className="text-red-600 text-sm hover:underline">Delete</button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>

      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Edit Payout</h3>
            <label className="block mb-2 text-sm text-gray-600">Amount</label>
            <input type="number" value={editItem.amount} onChange={(e) => setEditItem({ ...editItem, amount: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <label className="block mb-2 text-sm text-gray-600">Payment Date</label>
            <input type="date" value={editItem.payment_date?.split('T')[0]} onChange={(e) => setEditItem({ ...editItem, payment_date: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <label className="block mb-2 text-sm text-gray-600">Status</label>
            <input type="text" value={editItem.status} onChange={(e) => setEditItem({ ...editItem, status: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <label className="block mb-2 text-sm text-gray-600">Attachment</label>
            {editItem.attachment_url && (
              <div className="flex justify-between items-center mb-2">
                <a href={editItem.attachment_url} target="_blank" className="text-blue-600 text-sm hover:underline">View Current</a>
                <button onClick={() => setEditItem({ ...editItem, attachment_url: null })} className="text-red-500 text-sm hover:underline">Remove</button>
              </div>
            )}
            <input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setEditFile(e.target.files?.[0] || null)} className="w-full border rounded-md p-2 mb-4" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={handleSaveEdit} className="px-4 py-2 bg-[#C6A664] text-[#0A1E2D] rounded-md hover:bg-[#b59655]">Save</button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              You are about to delete the payout for{' '}
              <strong>{sources.find(s => s.id === deleteTarget.source_id)?.source_name || 'this source'}</strong>.<br />
              Amount: ${deleteTarget.amount}<br />
              Date: {deleteTarget.payment_date}<br />
              {deleteTarget.attachment_url && (
                <a href={deleteTarget.attachment_url} target="_blank" className="text-blue-600 underline text-sm block mt-2">
                  View Attachment
                </a>
              )}
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
