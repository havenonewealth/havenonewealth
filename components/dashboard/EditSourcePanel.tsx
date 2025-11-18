'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface IncomeSource {
  id: string
  user_id: string
  source_name: string
  source_type?: string
  frequency?: string
  expected_amount?: number
}

interface Props {
  open: boolean
  onClose: () => void
  source: IncomeSource | null
  onUpdated: () => void
}

export default function EditSourcePanel({ open, onClose, source, onUpdated }: Props) {
  const [name, setName] = useState('')
  const [frequency, setFrequency] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Populate fields when source changes
  useEffect(() => {
    if (!source) return
    setName(source.source_name || '')
    setFrequency(source.frequency || '')
    setAmount(source.expected_amount?.toString() || '')
    setMessage('')
  }, [source])

  const handleUpdate = async (e: any) => {
    e.preventDefault()
    if (!source) return

    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('income_sources')
      .update({
        source_name: name,
        frequency: frequency || null,
        expected_amount: amount ? Number(amount) : null
      })
      .eq('id', source.id)

    if (error) {
      setMessage('Error updating source.')
      setLoading(false)
      return
    }

    setMessage('Source updated successfully!')
    onUpdated()
    setLoading(false)

    setTimeout(onClose, 200)
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          onClick={onClose}
        />
      )}

      {/* Slide Panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[420px] bg-white z-[100] shadow-2xl
          border-l-2 border-[#C6A664]
          transform transition-transform duration-300 ease-in-out
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-8 h-full flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-[#0A1E2D]">
            Edit Source
          </h2>

          {!source ? (
            <p className="text-gray-500">No source selected.</p>
          ) : (
            <form className="space-y-5 flex-1 flex flex-col" onSubmit={handleUpdate}>
              
              {/* Source Name */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                  Source Name
                </label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-md bg-gray-50"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              {/* Frequency */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                  Frequency
                </label>
                <select
                  className="w-full p-2 border rounded-md bg-gray-50"
                  value={frequency}
                  onChange={e => setFrequency(e.target.value)}
                >
                  <option value="">Select frequency</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                  <option value="One-Time">One-Time</option>
                </select>
              </div>

              {/* Expected Amount */}
              <div>
                <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                  Expected Monthly Amount
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-md bg-gray-50"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                />
              </div>

              {/* Message */}
              {message && <p className="text-sm text-green-600">{message}</p>}

              {/* Action Buttons */}
              <div className="mt-auto flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] font-semibold hover:bg-[#b99850] transition"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  )
}
