'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Payout {
  id: string
  source_id: string
  user_id: string
  amount: number
  payment_date: string
  status: string
  attachment_url: string | null
  income_sources?: { source_name: string }
}

export default function PayoutsSection({ userId, isAdmin = false }: { userId: string | null, isAdmin?: boolean }) {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null)
  const [newPayout, setNewPayout] = useState({ source_id: '', amount: '', payment_date: '', status: '', file: null as File | null })
  const [editPayout, setEditPayout] = useState<Payout | null>(null)

  useEffect(() => {
    fetchPayouts()
    fetchSources()
  }, [userId])

  const fetchSources = async () => {
    const { data } = await supabase.from('income_sources').select('id, source_name')
    setSources(data || [])
  }

  const fetchPayouts = async () => {
    setLoading(true)
    let query = supabase
      .from('payouts')
      .select('*, income_sources(source_name)')
      .order('payment_date', { ascending: false })

    if (!isAdmin && userId) query = query.eq('user_id', userId)

    const { data, error } = await query
    if (!error && data) setPayouts(data)
    setLoading(false)
  }

  const uploadFile = async (file: File, payoutId: string) => {
    const path = `payouts/${userId}/${payoutId}/${file.name}`
    await supabase.storage.from('payouts').remove([path])
    const { error } = await supabase.storage.from('payouts').upload(path, file, { upsert: true })
    if (error) throw error
    const { data } = supabase.storage.from('payouts').getPublicUrl(path)
    return data.publicUrl
  }

  const handleAdd = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return alert('Session expired.')
      if (!newPayout.source_id || !newPayout.amount || !newPayout.payment_date)
        return alert('Please fill in all required fields.')

      const { data, error } = await supabase
        .from('payouts')
        .insert([{ 
          user_id: user.id, 
          source_id: newPayout.source_id, 
          amount: Number(newPayout.amount), 
          payment_date: newPayout.payment_date, 
          status: newPayout.status || 'Paid' 
        }])
        .select()
        .single()

      if (error) throw error

      let attachment_url = null
      if (newPayout.file) {
        attachment_url = await uploadFile(newPayout.file, data.id)
        await supabase.from('payouts').update({ attachment_url }).eq('id', data.id)
      }

      setNewPayout({ source_id: '', amount: '', payment_date: '', status: '', file: null })
      setShowModal(false)
      fetchPayouts()
      alert('Payout added successfully.')
    } catch (err: any) {
      alert('Error adding payout: ' + err.message)
    }
  }

  const handleEdit = async () => {
    if (!editPayout) return
    try {
      const { error } = await supabase
        .from('payouts')
        .update({
          amount: editPayout.amount,
          payment_date: editPayout.payment_date,
          status: editPayout.status
        })
        .eq('id', editPayout.id)
      if (error) throw error
      setEditPayout(null)
      fetchPayouts()
      alert('Payout updated successfully.')
    } catch (err: any) {
      alert('Error updating payout: ' + err.message)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payout?')) return
    await supabase.from('payouts').delete().eq('id', id)
    fetchPayouts()
  }

  const handleFileReplace = async (payout: Payout, file: File) => {
    try {
      const url = await uploadFile(file, payout.id)
      await supabase.from('payouts').update({ attachment_url: url }).eq('id', payout.id)
      fetchPayouts()
      alert('Attachment replaced successfully.')
    } catch (err: any) {
      alert('Error replacing attachment: ' + err.message)
    }
  }

  const openPreview = (url: string) => {
    setSelectedAttachment(url)
    setShowPreview(true)
  }

  return (
    <section className="mt-10">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-[#0A1E2D]">Payouts</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
        >
          + Add New Payout
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading payouts...</p>
      ) : payouts.length === 0 ? (
        <p className="text-gray-500">No payouts yet.</p>
      ) : (
        <div className="space-y-3">
          {payouts.map((p) => (
            <div key={p.id} className="border border-gray-200 p-4 rounded-lg bg-[#fdfbf7] flex justify-between items-center">
              <div>
                <p className="font-semibold">{p.income_sources?.source_name}</p>
                <p className="text-sm text-gray-600">
                  {p.payment_date} • ${p.amount?.toLocaleString()} • {p.status}
                </p>
              </div>
              <div className="flex gap-3 items-center">
                <label className="text-sm text-blue-600 hover:underline cursor-pointer">
                  Replace
                  <input type="file" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileReplace(p, e.target.files[0])} />
                </label>
                {p.attachment_url && (
                  <button onClick={() => openPreview(p.attachment_url)} className="text-sm text-[#0A1E2D] underline">
                    View
                  </button>
                )}
                <button onClick={() => setEditPayout(p)} className="text-sm text-blue-600 hover:underline">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-sm text-red-600 hover:underline">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Add Payout</h3>
            <select
              value={newPayout.source_id}
              onChange={(e) => setNewPayout({ ...newPayout, source_id: e.target.value })}
              className="w-full border rounded-md p-2 mb-3"
            >
              <option value="">Select Source</option>
              {sources.map((s) => (
                <option key={s.id} value={s.id}>{s.source_name}</option>
              ))}
            </select>
            <input type="number" placeholder="Amount" value={newPayout.amount}
              onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <input type="date" value={newPayout.payment_date}
              onChange={(e) => setNewPayout({ ...newPayout, payment_date: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <input type="text" placeholder="Status" value={newPayout.status}
              onChange={(e) => setNewPayout({ ...newPayout, status: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <input type="file" onChange={(e) => setNewPayout({ ...newPayout, file: e.target.files?.[0] || null })} className="w-full border rounded-md p-2 mb-3" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Edit Payout</h3>
            <input type="number" value={editPayout.amount} onChange={(e) => setEditPayout({ ...editPayout, amount: Number(e.target.value) })} className="w-full border rounded-md p-2 mb-3" />
            <input type="date" value={editPayout.payment_date} onChange={(e) => setEditPayout({ ...editPayout, payment_date: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <input type="text" value={editPayout.status} onChange={(e) => setEditPayout({ ...editPayout, status: e.target.value })} className="w-full border rounded-md p-2 mb-3" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditPayout(null)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
              <button onClick={handleEdit} className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedAttachment && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-3xl max-h-[90vh] overflow-auto relative">
            <button onClick={() => setShowPreview(false)} className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl">&times;</button>
            {selectedAttachment.endsWith('.pdf') ? (
              <iframe src={selectedAttachment} className="w-[700px] h-[80vh]" />
            ) : (
              <img src={selectedAttachment} alt="Attachment" className="max-w-full max-h-[80vh] mx-auto rounded-lg" />
            )}
          </div>
        </div>
      )}
    </section>
  )
}
