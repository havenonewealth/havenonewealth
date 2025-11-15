'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { logError } from '@/app/utils/logger'

interface Payout {
  id: string
  source_id: string
  amount: number
  payment_date: string
  status: string
  attachment_url: string | null
}

interface Props {
  sourceId: string
  userId: string
}

export default function PayoutsSection({ sourceId, userId }: Props) {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editItem, setEditItem] = useState<Payout | null>(null)
  const [newPayout, setNewPayout] = useState({
    amount: '',
    payment_date: '',
    status: '',
    attachment_url: ''
  })
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (sourceId && userId) fetchPayouts()
  }, [sourceId, userId])

  const fetchPayouts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('source_id', sourceId)
        .eq('user_id', userId)
        .order('payment_date', { ascending: false })
      if (error) throw error
      setPayouts(data || [])
    } catch (err) {
      await logError('payouts-fetch', err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      if (!file) return null
      setUploading(true)
      const path = `${userId}/${Date.now()}-${file.name}`
      const { error } = await supabase.storage
        .from('payout-attachments')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (error) throw error
      const { data } = supabase.storage.from('payout-attachments').getPublicUrl(path)
      return data.publicUrl
    } catch (err) {
      await logError('payouts-upload', err)
      return null
    } finally {
      setUploading(false)
    }
  }

  const addPayout = async (e: any) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('payouts').insert([
        {
          user_id: userId,
          source_id: sourceId,
          amount: parseFloat(newPayout.amount),
          payment_date: newPayout.payment_date,
          status: newPayout.status,
          attachment_url: newPayout.attachment_url || null
        }
      ])
      if (error) throw error
      setShowAddModal(false)
      setNewPayout({ amount: '', payment_date: '', status: '', attachment_url: '' })
      fetchPayouts()
    } catch (err) {
      await logError('payouts-insert', err)
    }
  }

  const handleEdit = (p: Payout) => {
    setEditItem(p)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    try {
      const { error } = await supabase
        .from('payouts')
        .update({
          amount: parseFloat(editItem.amount as any),
          payment_date: editItem.payment_date,
          status: editItem.status,
          attachment_url: editItem.attachment_url
        })
        .eq('id', editItem.id)
      if (error) throw error
      setShowEditModal(false)
      setEditItem(null)
      fetchPayouts()
    } catch (err) {
      await logError('payouts-edit', err)
    }
  }

  const handleDelete = async (id: string, attachmentUrl?: string | null) => {
    try {
      if (!confirm('Delete this payout?')) return
      if (attachmentUrl) {
        const path = attachmentUrl.split('/payout-attachments/')[1]
        if (path) await supabase.storage.from('payout-attachments').remove([path])
      }
      const { error } = await supabase.from('payouts').delete().eq('id', id)
      if (error) throw error
      fetchPayouts()
    } catch (err) {
      await logError('payouts-delete', err)
    }
  }

  return (
    <section className="mt-6 bg-[#fdfbf7] border border-gray-200 rounded-xl p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-[#0A1E2D]">Payouts</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#C6A664] text-[#0A1E2D] px-3 py-1 rounded-md hover:bg-[#b59655]"
        >
          + Add
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500 text-sm">Loading payouts...</p>
      ) : payouts.length === 0 ? (
        <p className="text-gray-500 text-sm">No payouts recorded yet.</p>
      ) : (
        <ul className="divide-y divide-gray-200">
          {payouts.map((p) => (
            <li key={p.id} className="py-3 flex justify-between items-center">
              <div>
                <p className="text-sm text-[#0A1E2D] font-medium">
                  ${p.amount.toLocaleString()} – {p.status}
                </p>
                <p className="text-xs text-gray-600">
                  {p.payment_date && new Date(p.payment_date).toLocaleDateString()}
                </p>
                {p.attachment_url && (
                  <a
                    href={p.attachment_url}
                    target="_blank"
                    className="text-xs text-blue-600 underline"
                  >
                    View Attachment
                  </a>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleEdit(p)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(p.id, p.attachment_url)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-[#0A1E2D]">Add Payout</h3>
            <form onSubmit={addPayout} className="flex flex-col gap-3">
              <input
                type="number"
                placeholder="Amount"
                value={newPayout.amount}
                onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })}
                required
                className="border rounded-md p-2"
              />
              <input
                type="date"
                value={newPayout.payment_date}
                onChange={(e) => setNewPayout({ ...newPayout, payment_date: e.target.value })}
                required
                className="border rounded-md p-2"
              />
              <input
                type="text"
                placeholder="Status (Paid / Pending)"
                value={newPayout.status}
                onChange={(e) => setNewPayout({ ...newPayout, status: e.target.value })}
                className="border rounded-md p-2"
              />
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const url = await handleFileUpload(file)
                    if (url) setNewPayout({ ...newPayout, attachment_url: url })
                  }
                }}
                className="border rounded-md p-2"
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-3 py-1 bg-[#C6A664] text-[#0A1E2D] rounded-md hover:bg-[#b59655]"
                >
                  {uploading ? 'Uploading...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[400px] shadow-xl">
            <h3 className="text-lg font-semibold mb-3 text-[#0A1E2D]">Edit Payout</h3>
            <input
              type="number"
              value={editItem.amount}
              onChange={(e) =>
                setEditItem({ ...editItem, amount: parseFloat(e.target.value) || 0 })
              }
              className="border rounded-md p-2 mb-3 w-full"
            />
            <input
              type="date"
              value={editItem.payment_date?.split('T')[0] || ''}
              onChange={(e) =>
                setEditItem({ ...editItem, payment_date: e.target.value })
              }
              className="border rounded-md p-2 mb-3 w-full"
            />
            <input
              type="text"
              value={editItem.status}
              onChange={(e) => setEditItem({ ...editItem, status: e.target.value })}
              className="border rounded-md p-2 mb-3 w-full"
            />
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={async (e) => {
                const file = e.target.files?.[0]
                if (file) {
                  const url = await handleFileUpload(file)
                  if (url) setEditItem({ ...editItem, attachment_url: url })
                }
              }}
              className="border rounded-md p-2 mb-3 w-full"
            />
            {editItem.attachment_url && (
              <a
                href={editItem.attachment_url}
                target="_blank"
                className="text-sm text-blue-600 underline mb-3 block"
              >
                View Current Attachment
              </a>
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-3 py-1 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={uploading}
                className="px-3 py-1 bg-[#C6A664] text-[#0A1E2D] rounded-md hover:bg-[#b59655]"
              >
                {uploading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
