'use client'

import Image from 'next/image'
import { useEffect, useState, useMemo } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const [sources, setSources] = useState<any[]>([])
  const [newSource, setNewSource] = useState({
    source_name: '',
    source_type: '',
    frequency: '',
    expected_amount: ''
  })
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSources()
  }, [])

  const fetchSources = async () => {
    const { data, error } = await supabase.from('income_sources').select('*')
    if (error) setMessage('Error loading data: ' + error.message)
    else setSources(data)
  }

  const addSource = async (e: any) => {
    e.preventDefault()
    const { error } = await supabase.from('income_sources').insert([newSource])
    if (error) setMessage('Error adding source: ' + error.message)
    else {
      setMessage('✅ Source added successfully!')
      setNewSource({ source_name: '', source_type: '', frequency: '', expected_amount: '' })
      fetchSources()
    }
  }

  const totalIncome = useMemo(() => {
    return sources.reduce((sum, src) => sum + (Number(src.expected_amount) || 0), 0)
  }, [sources])

  return (
    <main className="min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] px-6 py-10 font-[var(--font-sans)]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">

        {/* Header Row: Logo + Titles */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-8">
          <div className="flex items-start gap-6">
            <Image
              src="/HOW2Logo.png"
              alt="Haven One Wealth Logo"
              width={160}
              height={60}
              className="rounded-md"
            />
            <div>
              <h1 className="text-3xl font-semibold text-[#0A1E2D] mb-1">
                Haven One Wealth Dashboard
              </h1>
              <p className="text-gray-600 text-[15px]">
                Track your royalties, residuals, and income sources.
              </p>
            </div>
          </div>

          {/* Summary Bar at the top-right */}
          {sources.length > 0 && (
            <div className="bg-[#fdf8ee] border border-[#E6E6E6] rounded-lg p-4 mt-6 md:mt-0 min-w-[260px] text-[#0A1E2D] shadow-sm self-start">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Total Expected Income</p>
                <p className="text-sm text-gray-600">Active Sources</p>
              </div>
              <div className="flex items-center justify-between mt-1">
                <h3 className="text-2xl font-semibold">
                  ${totalIncome.toLocaleString()}
                </h3>
                <h3 className="text-2xl font-semibold">{sources.length}</h3>
              </div>
            </div>
          )}
        </div>

        {/* Body Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Form Section */}
          <form onSubmit={addSource} className="flex flex-col gap-6 max-w-md">
            {['source_name', 'source_type', 'frequency', 'expected_amount'].map((field, i) => (
              <div className="relative" key={field}>
                <input
                  type={field === 'expected_amount' ? 'number' : 'text'}
                  id={field}
                  value={(newSource as any)[field]}
                  onChange={(e) => setNewSource({ ...newSource, [field]: e.target.value })}
                  className="peer w-full border border-gray-300 rounded-md px-4 pt-5 pb-2 text-[15px] text-[#0A1E2D] placeholder-transparent focus:ring-2 focus:ring-[#C6A664] focus:border-[#C6A664] focus:outline-none transition-all"
                  placeholder={field}
                  required={field === 'source_name'}
                />
                <label
                  htmlFor={field}
                  className="absolute left-4 top-2.5 text-gray-500 text-[13px] transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-gray-400 peer-placeholder-shown:text-[15px] peer-placeholder-shown:font-normal peer-focus:top-2.5 peer-focus:text-[13px] peer-focus:text-[#C6A664]"
                >
                  {field === 'source_name'
                    ? 'Source Name (e.g. Spotify)'
                    : field === 'source_type'
                    ? 'Type (Royalty / Residual)'
                    : field === 'frequency'
                    ? 'Frequency (Monthly / Quarterly)'
                    : 'Expected Amount'}
                </label>
              </div>
            ))}

            <button
              type="submit"
              className="bg-[#C6A664] hover:bg-[#b59655] text-[#0A1E2D] font-semibold py-2.5 px-4 rounded-md transition-transform duration-200 transform hover:scale-[1.02] shadow-sm focus:ring-2 focus:ring-[#C6A664] focus:outline-none"
            >
              Add Source
            </button>
            {message && <p className="text-sm text-gray-700">{message}</p>}
          </form>

          {/* Income Section */}
          <div>
            <h2 className="text-xl font-semibold text-[#0A1E2D] mb-4 border-b border-gray-200 pb-2">
              Your Income Sources
            </h2>

            <div
              className="grid gap-6"
              style={{
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))'
              }}
            >
              {sources.map((src, index) => (
                <div
                  key={src.id}
                  className={`p-6 rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 ${
                    index % 2 === 0
                      ? 'bg-[#fffdfa] border-[#E6E6E6] hover:border-[#C6A664]'
                      : 'bg-[#fdf8ee] border-[#E6E6E6] hover:border-[#C6A664]'
                  }`}
                >
                  <h3 className="text-lg font-semibold text-[#0A1E2D] mb-1">{src.source_name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <span className="font-medium text-[#C6A664]">{src.source_type}</span>
                    <span className="text-gray-400">•</span>
                    <span>{src.frequency}</span>
                  </p>
                  <p className="text-md font-semibold text-[#0A1E2D] mt-3">
                    ${Number(src.expected_amount).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
