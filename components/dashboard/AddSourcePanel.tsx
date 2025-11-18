'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface GlossaryItem {
  main_category: string
  sub_category: string
  specific_type: string
  default_frequency?: string
}

interface Props {
  open: boolean
  onClose: () => void
  glossary: GlossaryItem[]
  onCreated: () => void
}

export default function AddSourcePanel({ open, onClose, glossary, onCreated }: Props) {
  const [mainCategory, setMainCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [specificType, setSpecificType] = useState('')
  const [frequency, setFrequency] = useState('')
  const [expectedAmount, setExpectedAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const filteredSubCategories = glossary
    .filter(g => g.main_category === mainCategory)
    .map(g => g.sub_category)

  const filteredSpecificTypes = glossary
    .filter(g => g.sub_category === subCategory)
    .map(g => g.specific_type)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setMessage('')

    if (!specificType) {
      setMessage('Please enter a specific type.')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setMessage('User not authenticated.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('income_sources').insert([
      {
        user_id: user.id,
        source_name: specificType,
        source_type: subCategory || null,
        frequency: frequency || null,
        expected_amount: expectedAmount ? Number(expectedAmount) : null
      }
    ])

    if (error) {
      setMessage('Error adding source.')
      setLoading(false)
      return
    }

    setMessage('Source added successfully!')
    setMainCategory('')
    setSubCategory('')
    setSpecificType('')
    setFrequency('')
    setExpectedAmount('')

    onCreated()
    setLoading(false)

    // slight delay for animation smoothness
    setTimeout(onClose, 200)
  }

  return (
    <>
      {/* Background overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
          onClick={onClose}
        />
      )}

      {/* Slide-in panel */}
      <div
        className={`
          fixed top-0 right-0 h-full w-[420px] bg-white z-[100] shadow-2xl
          transform transition-transform duration-300 ease-in-out border-l-2 border-[#C6A664]
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="p-8 h-full flex flex-col">
          <h2 className="text-2xl font-semibold mb-6 text-[#0A1E2D]">
            Add New Income Source
          </h2>

          <form className="space-y-5 flex-1 flex flex-col" onSubmit={handleSubmit}>
            {/* Main Category */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                Main Category
              </label>
              <select
                value={mainCategory}
                onChange={e => {
                  setMainCategory(e.target.value)
                  setSubCategory('')
                  setSpecificType('')
                }}
                className="w-full p-2 border rounded-md bg-gray-50"
              >
                <option value="">Select category</option>
                {[...new Set(glossary.map(g => g.main_category))].map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sub Category */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                Sub Category
              </label>
              <select
                value={subCategory}
                onChange={e => {
                  setSubCategory(e.target.value)
                  setSpecificType('')
                }}
                className="w-full p-2 border rounded-md bg-gray-50"
                disabled={!mainCategory}
              >
                <option value="">Select sub category</option>
                {filteredSubCategories.map(sub => (
                  <option key={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Specific Type */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                Specific Type
              </label>
              <input
                type="text"
                placeholder="Royalty, Affiliate, Rental..."
                value={specificType}
                onChange={e => setSpecificType(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50"
              />
            </div>

            {/* Frequency */}
            <div>
              <label className="block mb-1 text-sm font-semibold text-[#0A1E2D]">
                Frequency
              </label>
              <select
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50"
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
                placeholder="500"
                value={expectedAmount}
                onChange={e => setExpectedAmount(e.target.value)}
                className="w-full p-2 border rounded-md bg-gray-50"
              />
            </div>

            {/* Message */}
            {message && (
              <div className="text-sm text-red-600 font-medium">{message}</div>
            )}

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
                {loading ? 'Saving...' : 'Add Source'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
