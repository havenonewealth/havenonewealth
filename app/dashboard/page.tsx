'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// ---------- Interfaces ----------
interface IncomeSource {
  id: string
  user_id: string
  source_name: string
  source_type?: string
  frequency?: string
  expected_amount?: number
}

interface Payout {
  id: string
  amount: number
  payout_date: string
  status: string
  source_id: string
  income_sources?: {
    source_name?: string
  } | null
}

interface GlossaryItem {
  main_category: string
  sub_category: string
  specific_type: string
  default_frequency?: string
}

// ---------- Component ----------
export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sources' | 'payouts'>('sources')
  const [glossary, setGlossary] = useState<GlossaryItem[]>([])
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [mainCategory, setMainCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [specificType, setSpecificType] = useState('')
  const [frequency, setFrequency] = useState('')
  const [expectedAmount, setExpectedAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [editItem, setEditItem] = useState<IncomeSource | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showAddPayout, setShowAddPayout] = useState(false)
  const [newPayout, setNewPayout] = useState({
    source_id: '',
    amount: '',
    payout_date: '',
    status: 'Pending'
  })

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return '$0.00'
    return value.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    })
  }

  // ---------- Initial Load ----------
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: roleData } = await supabase.from('users').select('role').eq('id', user.id).single()
      setUserRole(roleData?.role || null)

      const { data: glossaryData } = await supabase.from('income_glossary').select('*')
      setGlossary(glossaryData || [])

      await Promise.all([fetchSources(), fetchPayouts(user.id)])
      setLoading(false)
    }
    loadData()
  }, [router])

  // ---------- Fetch Data ----------
  const fetchSources = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('income_sources').select('*').eq('user_id', user.id)
    setSources((data as IncomeSource[]) || [])
  }

  const fetchPayouts = async (userId: string) => {
    const { data, error } = await supabase
      .from('payouts')
      .select(`
        id,
        amount,
        payout_date,
        status,
        source_id,
        income_sources (source_name)
      `)
      .eq('user_id', userId)
      .order('payout_date', { ascending: false })

    if (error) {
      console.error('Error fetching payouts:', error)
      setPayouts([])
      return
    }

    // Normalize the relationship in case Supabase returns arrays
    const normalized = (data || []).map((item: any) => ({
      ...item,
      income_sources:
        Array.isArray(item.income_sources) && item.income_sources.length > 0
          ? item.income_sources[0]
          : item.income_sources || null
    }))

    setPayouts(normalized)
  }


  // ---------- CRUD ----------
  const handleAddSource = async (e: any) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (!specificType) {
      setMessage('Please fill all required fields.')
      return
    }

    const { error } = await supabase.from('income_sources').insert([
      {
        user_id: user.id,
        source_name: specificType,
        source_type: subCategory,
        frequency,
        expected_amount: expectedAmount ? Number(expectedAmount) : null
      }
    ])

    if (error) setMessage('Error adding income source.')
    else {
      setMessage('✅ Source added successfully!')
      await fetchSources()
      setMainCategory('')
      setSubCategory('')
      setSpecificType('')
      setFrequency('')
      setExpectedAmount('')
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete source "${name}" and all related payouts?`)) return
    const { error } = await supabase.from('income_sources').delete().eq('id', id)
    if (error) alert('Error deleting source.')
    else {
      await fetchSources()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) await fetchPayouts(user.id)
    }
  }

  const handleEdit = (item: IncomeSource) => {
    setEditItem(item)
    setShowEditModal(true)
  }

  const handleSaveEdit = async () => {
    if (!editItem) return
    const { id, source_name, frequency, expected_amount } = editItem
    const { error } = await supabase
      .from('income_sources')
      .update({ source_name, frequency, expected_amount: Number(expected_amount) })
      .eq('id', id)
    if (error) alert('Error updating source.')
    else {
      setShowEditModal(false)
      await fetchSources()
    }
  }

  const handleAddPayout = async (e: any) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('payouts').insert([
      {
        source_id: newPayout.source_id,
        user_id: user.id,
        amount: parseFloat(newPayout.amount),
        payout_date: newPayout.payout_date,
        status: newPayout.status
      }
    ])
    if (error) {
      console.error('Error adding payout:', error)
      alert('Error adding payout.')
    } else {
      setShowAddPayout(false)
      setNewPayout({ source_id: '', amount: '', payout_date: '', status: 'Pending' })
      await fetchPayouts(user.id)
    }
  }

  // ---------- Glossary Logic ----------
  const mainOptions = [...new Set(glossary.map((g) => g.main_category))]
  const subOptions = [...new Set(glossary.filter((g) => g.main_category === mainCategory).map((g) => g.sub_category))]
  const specificOptions = glossary.filter((g) => g.main_category === mainCategory && g.sub_category === subCategory)

  const handleSpecificChange = (value: string) => {
    setSpecificType(value)
    const found = glossary.find((g) => g.specific_type === value)
    if (found) setFrequency(found.default_frequency || '')
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  // ---------- UI ----------
  if (loading)
    return (
      <main className="flex items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 mx-auto mb-3 text-[#C6A664]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z" />
          </svg>
          <p>Loading dashboard...</p>
        </div>
      </main>
    )

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" alt="Haven One Wealth Logo" width={160} height={60} />
          <div className="flex gap-3">
            <button
              onClick={() => setActiveTab('sources')}
              className={`px-4 py-2 rounded-md font-semibold ${
                activeTab === 'sources' ? 'bg-[#C6A664] text-[#0A1E2D]' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Sources
            </button>
            <button
              onClick={() => setActiveTab('payouts')}
              className={`px-4 py-2 rounded-md font-semibold ${
                activeTab === 'payouts' ? 'bg-[#C6A664] text-[#0A1E2D]' : 'bg-gray-200 text-gray-800'
              }`}
            >
              Payouts
            </button>
            {userRole === 'admin' && (
              <button
                onClick={() => router.push('/admin-dashboard')}
                className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
              >
                Admin
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ---------- SOURCES TAB ---------- */}
        {activeTab === 'sources' && (
          <>
            <h1 className="text-2xl font-semibold mb-6">Income Sources</h1>
            <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <select
                value={mainCategory}
                onChange={(e) => {
                  setMainCategory(e.target.value)
                  setSubCategory('')
                  setSpecificType('')
                }}
                className="border p-2 rounded-md"
              >
                <option value="">Select Main Category</option>
                {mainOptions.map((cat, i) => (
                  <option key={i} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={subCategory}
                onChange={(e) => {
                  setSubCategory(e.target.value)
                  setSpecificType('')
                }}
                className="border p-2 rounded-md"
                disabled={!mainCategory}
              >
                <option value="">Select Sub Category</option>
                {subOptions.map((sub, i) => (
                  <option key={i} value={sub}>{sub}</option>
                ))}
              </select>

              <select
                value={specificType}
                onChange={(e) => handleSpecificChange(e.target.value)}
                className="border p-2 rounded-md"
                disabled={!subCategory}
              >
                <option value="">Select Type</option>
                {specificOptions.map((s, i) => (
                  <option key={i} value={s.specific_type}>{s.specific_type}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="border p-2 rounded-md"
              />
              <input
                type="number"
                placeholder="Expected Amount"
                value={expectedAmount}
                onChange={(e) => setExpectedAmount(e.target.value)}
                className="border p-2 rounded-md"
              />
              <button
                type="submit"
                className="bg-[#C6A664] text-[#0A1E2D] rounded-md font-semibold hover:bg-[#b59655]"
              >
                Add Source
              </button>
            </form>

            {sources.length === 0 ? (
              <p className="text-gray-500">No income sources added yet.</p>
            ) : (
              <ul className="space-y-3">
                {sources.map((src) => (
                  <li
                    key={src.id}
                    className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition flex justify-between items-center"
                  >
                    <div>
                      <p className="text-lg font-semibold">{src.source_name}</p>
                      <p className="text-sm text-gray-600">
                        {src.source_type} • {src.frequency} • {formatCurrency(src.expected_amount)}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={() => handleEdit(src)} className="text-blue-600 hover:underline">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(src.id, src.source_name)} className="text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {/* ---------- PAYOUTS TAB ---------- */}
        {activeTab === 'payouts' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-semibold">Payouts</h1>
              <button
                onClick={() => setShowAddPayout(true)}
                className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655]"
              >
                + Add Payout
              </button>
            </div>
            {payouts.length === 0 ? (
              <p className="text-gray-500">No payout data available yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead className="bg-[#f9f7f3]">
                    <tr>
                      <th className="p-3 text-left">Source</th>
                      <th className="p-3 text-left">Amount</th>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((p) => (
                      <tr key={p.id} className="border-t hover:bg-[#fdfbf7]">
                        <td className="p-3">{p.income_sources?.source_name || '—'}</td>
                        <td className="p-3">{formatCurrency(p.amount)}</td>
                        <td className="p-3">{new Date(p.payout_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className={`p-3 capitalize ${p.status === 'Paid' ? 'text-green-600' : p.status === 'Pending' ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {p.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* ---------- EDIT MODAL ---------- */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Edit Income Source</h3>
            <label className="block mb-2 text-sm text-gray-600">Source Name</label>
            <input
              type="text"
              value={editItem.source_name}
              onChange={(e) => setEditItem({ ...editItem, source_name: e.target.value })}
              className="w-full border rounded-md p-2 mb-4"
            />
            <label className="block mb-2 text-sm text-gray-600">Frequency</label>
            <input
              type="text"
              value={editItem.frequency || ''}
              onChange={(e) => setEditItem({ ...editItem, frequency: e.target.value })}
              className="w-full border rounded-md p-2 mb-4"
            />
            <label className="block mb-2 text-sm text-gray-600">Expected Amount</label>
            <input
              type="text"
              value={editItem.expected_amount ? `$${Number(editItem.expected_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : ''}
              onChange={(e) => {
                const rawValue = e.target.value.replace(/[^0-9.]/g, '')
                setEditItem({ ...editItem, expected_amount: parseFloat(rawValue) || 0 })
              }}
              className="w-full border rounded-md p-2 mb-6 text-right"
            />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                Cancel
              </button>
              <button onClick={handleSaveEdit} className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- ADD PAYOUT MODAL ---------- */}
      {showAddPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[420px] shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-[#0A1E2D]">Add New Payout</h3>
            <form onSubmit={handleAddPayout}>
              <label className="block mb-2 text-sm text-gray-600">Source</label>
              <select
                value={newPayout.source_id}
                onChange={(e) => setNewPayout({ ...newPayout, source_id: e.target.value })}
                className="w-full border rounded-md p-2 mb-4"
              >
                <option value="">Select Source</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.source_name}</option>
                ))}
              </select>

              <label className="block mb-2 text-sm text-gray-600">Amount</label>
              <input
                type="number"
                value={newPayout.amount}
                onChange={(e) => setNewPayout({ ...newPayout, amount: e.target.value })}
                className="w-full border rounded-md p-2 mb-4"
              />

              <label className="block mb-2 text-sm text-gray-600">Payment Date</label>
              <input
                type="date"
                value={newPayout.payout_date}
                onChange={(e) => setNewPayout({ ...newPayout, payout_date: e.target.value })}
                className="w-full border rounded-md p-2 mb-4"
              />

              <label className="block mb-2 text-sm text-gray-600">Status</label>
              <select
                value={newPayout.status}
                onChange={(e) => setNewPayout({ ...newPayout, status: e.target.value })}
                className="w-full border rounded-md p-2 mb-6"
              >
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
                <option value="Scheduled">Scheduled</option>
              </select>

              <div className="flex justify-end gap-3">
                <button onClick={() => setShowAddPayout(false)} type="button" className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 rounded-md bg-[#C6A664] text-[#0A1E2D] hover:bg-[#b59655]">
                  Save Payout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
