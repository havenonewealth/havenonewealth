'use client'

import { supabase } from '@/lib/supabaseClient'

interface Props {
  open: boolean
  onClose: () => void
  sourceId: string | null
  sourceName: string | null
  onDeleted: () => void
}

export default function DeleteSourceModal({
  open,
  onClose,
  sourceId,
  sourceName,
  onDeleted
}: Props) {
  const handleDelete = async () => {
    if (!sourceId) return

    const { error } = await supabase
      .from('income_sources')
      .delete()
      .eq('id', sourceId)

    if (error) {
      console.error('Delete error:', error)
      return
    }

    onDeleted()
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] opacity-100 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Modal */}
      <div
        className={`
          fixed top-1/2 left-1/2 z-[100]
          bg-white w-[90%] max-w-md p-8 rounded-2xl shadow-2xl border border-[#C6A664]
          transform -translate-x-1/2 -translate-y-1/2
          transition-all duration-300
          ${open ? 'scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}
        `}
      >
        <h2 className="text-2xl font-semibold text-[#0A1E2D] mb-4">
          Delete Source
        </h2>

        <p className="text-gray-700 mb-6 leading-relaxed">
          Are you sure you want to delete  
          <span className="font-semibold text-[#C6A664]">
            {` ${sourceName || ''}`}
          </span>?  
          This will also remove all associated payouts.  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 transition"
            onClick={handleDelete}
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}
