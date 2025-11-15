'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'sources' | 'payouts'>('sources')
  const [glossary, setGlossary] = useState<any[]>([])
  const [sources, setSources] = useState<any[]>([])
  const [payouts, setPayouts] = useState<any[]>([])
  const [mainCategory, setMainCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [specificType, setSpecificType] = useState('')
  const [frequency, setFrequency] = useState('')
  const [expectedAmount, setExpectedAmount] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Role
      const { data: roleData } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()
      setUserRole(roleData?.role || null)

      // Glossary
      const { data: glossaryData } = await supabase
        .from('income_glossary')
        .select('*')
        .order('main_category', { ascending: true })
      setGlossary(glossaryData || [])

      await Promise.all([fetchSources(), fetchPayouts()])
      setLoading(false)
    }
    loadData()
  }, [router])

  const fetchSources = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('income_sources')
      .select('*')
      .eq('user_id', user.id)
    setSources(data || [])
  }

  const fetchPayouts = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('payouts')
      .select('*, income_sources(source_name)')
      .eq('user_id', user.id)
      .order('payout_date', { ascending: false })
    setPayouts(data || [])
  }

  const handleAddSource = async (e: any) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (!specificType || !expectedAmount) {
      setMessage('Please fill all required fields.')
      return
    }

    const { error } = await supabase.from('income_sources').insert([
      {
        user_id: user.id,
        source_name: specificType,
        source_type: subCategory,
        frequency: frequency || null,
        expected_amount: Number(expectedAmount)
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

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const mainOptions = [...new Set(glossary.map((g) => g.main_category))]
  const subOptions = [...new Set(glossary.filter((g) => g.main_category === mainCategory).map((g) => g.sub_category))]
  const specificOptions = glossary.filter((g) => g.main_category === mainCategory && g.sub_category === subCategory)

  const handleSpecificChange = (value: string) => {
    setSpecificType(value)
    const found = glossary.find((g) => g.specific_type === value)
    if (found) setFrequency(found.default_frequency || '')
  }

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

        {activeTab === 'sources' && (
          <>
            <h1 className="text-2xl font-semibold mb-6">Income Sources</h1>

            <form onSubmit={handleAddSource} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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
              <button type="submit" className="bg-[#C6A664] text-[#0A1E2D] rounded-md font-semibold hover:bg-[#b59655]">
                Add Source
              </button>
            </form>

            {message && <p className="text-gray-700 mb-4">{message}</p>}

            <ul className="space-y-3">
              {sources.length === 0 ? (
                <p className="text-gray-500">No income sources added yet.</p>
              ) : (
                sources.map((src) => (
                  <li key={src.id} className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition">
                    <p className="text-lg font-semibold">{src.source_name}</p>
                    <p className="text-sm text-gray-600">
                      {src.source_type} • {src.frequency} • ${src.expected_amount}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </>
        )}

        {activeTab === 'payouts' && (
          <>
            <h1 className="text-2xl font-semibold mb-6">Payouts</h1>
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
                        <td className="p-3">${p.amount?.toLocaleString()}</td>
                        <td className="p-3">{new Date(p.payout_date).toLocaleDateString()}</td>
                        <td className="p-3 capitalize">{p.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
