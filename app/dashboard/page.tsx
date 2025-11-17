'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

// @ts-ignore - Prevent missing type declarations for echarts
import * as echarts from 'echarts'
// @ts-ignore - Prevent missing type declarations for file-saver
import { saveAs } from 'file-saver'

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
  payment_date: string
  status: string
  source_id: string
  income_sources?: { source_name?: string } | null
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
  const [activeTab, setActiveTab] = useState<'sources' | 'payouts' | 'analytics'>('sources')
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
    payment_date: '',
    status: 'Pending'
  })

  const formatCurrency = (value: number | null | undefined) => {
    if (!value || isNaN(value)) return '$0.00'
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
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

  // ---------- Fetch ----------
  const fetchSources = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase.from('income_sources').select('*').eq('user_id', user.id)
    setSources((data as IncomeSource[]) || [])
  }

  const fetchPayouts = async (userId: string) => {
    const { data, error } = await supabase
      .from('payouts')
      .select(`id, amount, payment_date, status, source_id, user_id, income_sources:income_sources!inner(source_name)`)
      .eq('user_id', userId)
      .order('payment_date', { ascending: false })

    if (error) return console.error('Error fetching payouts:', error)
    const normalized = data.map((p: any) => ({
      ...p,
      income_sources: Array.isArray(p.income_sources) ? p.income_sources[0] : p.income_sources
    }))
    setPayouts(normalized)
  }

  // ---------- CRUD ----------
  const handleAddSource = async (e: any) => {
    e.preventDefault()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (!specificType) return setMessage('Please fill all required fields.')

    const { error } = await supabase.from('income_sources').insert([{
      user_id: user.id,
      source_name: specificType,
      source_type: subCategory,
      frequency,
      expected_amount: expectedAmount ? Number(expectedAmount) : null
    }])

    if (error) setMessage('Error adding income source.')
    else {
      setMessage('✅ Source added successfully!')
      await fetchSources()
      setMainCategory(''); setSubCategory(''); setSpecificType(''); setFrequency(''); setExpectedAmount('')
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
    const { error } = await supabase.from('payouts').insert([{
      source_id: newPayout.source_id,
      user_id: user.id,
      amount: parseFloat(newPayout.amount),
      payment_date: newPayout.payment_date,
      status: newPayout.status
    }])
    if (error) alert('Error adding payout.')
    else {
      setShowAddPayout(false)
      setNewPayout({ source_id: '', amount: '', payment_date: '', status: 'Pending' })
      await fetchPayouts(user.id)
    }
  }

  // ---------- Analytics ----------
  useEffect(() => {
    if (activeTab !== 'analytics' || payouts.length === 0) return
    const chartDom = document.getElementById('analyticsChart')
    if (!chartDom) return

    const chart = echarts.init(chartDom)
    const grouped = payouts.reduce((acc: any, p) => {
      const key = p.income_sources?.source_name || 'Unknown'
      acc[key] = (acc[key] || 0) + Number(p.amount)
      return acc
    }, {})

    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Amount'] },
      xAxis: { type: 'category', data: Object.keys(grouped) },
      yAxis: { type: 'value' },
      series: [
        {
          name: 'Amount',
          type: 'bar',
          data: Object.values(grouped),
          itemStyle: { color: '#C6A664' }
        }
      ]
    }

    // ✅ Professional fix for type mismatch
    chart.setOption(option as any)

    return () => chart.dispose()
  }, [activeTab, payouts])

  // ---------- Export CSV ----------
  const handleExport = async () => {
    const csvContent = [
      ['Source', 'Amount', 'Payment Date', 'Status'],
      ...payouts.map(p => [
        p.income_sources?.source_name || '',
        p.amount,
        p.payment_date,
        p.status
      ])
    ].map(e => e.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const fileName = `HavenOne_Payouts_${new Date().toISOString().slice(0, 10)}.csv`
    saveAs(blob, fileName)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { error } = await supabase.storage
        .from('havenoone_exports')
        .upload(`exports/${user.id}/${fileName}`, blob, { upsert: true })
      if (error) console.error('Error uploading CSV:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
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
            {['sources', 'payouts', 'analytics'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md font-semibold ${
                  activeTab === tab ? 'bg-[#C6A664] text-[#0A1E2D]' : 'bg-gray-200 text-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
            {userRole === 'admin' && (
              <button onClick={() => router.push('/admin-dashboard')} className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition">
                Admin
              </button>
            )}
            <button onClick={handleLogout} className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition">
              Logout
            </button>
          </div>
        </div>

        {/* ---------- Analytics ---------- */}
        {activeTab === 'analytics' && (
          <>
            <h1 className="text-2xl font-semibold mb-4">Analytics Overview</h1>
            <div id="analyticsChart" style={{ width: '100%', height: '400px' }} />
          </>
        )}
      </div>
    </main>
  )
}
