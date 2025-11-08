'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import Image from 'next/image'

export default function AnalyticsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<any[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) router.push('/login')
      else fetchSummary()
    }
    checkUser()
  }, [router])

  const fetchSummary = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('v_user_payout_summary')
      .select('*')
      .eq('user_id', user.id)
    if (error) setMessage('Error loading analytics: ' + error.message)
    else setSummary(data)
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
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push('/payouts')}
              className="bg-[#C6A664] text-[#0A1E2D] px-4 py-2 rounded-md font-semibold hover:bg-[#b59655] transition"
            >
              Payouts
            </button>
            <button
              onClick={handleLogout}
              className="bg-[#0A1E2D] text-white px-4 py-2 rounded-md hover:bg-[#C6A664] transition"
            >
              Logout
            </button>
          </div>
        </div>

        <h1 className="text-3xl font-semibold mb-2 text-[#0A1E2D]">Analytics & Insights</h1>
        <p className="text-gray-600 mb-8 text-[15px]">
          Review performance of your royalties and residual income sources.
        </p>

        {message && <p className="text-sm mb-4">{message}</p>}

        {summary.length === 0 ? (
          <p className="text-gray-500">No payout data available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {summary.map((item) => (
              <div
                key={item.source_name}
                className="border border-gray-200 p-6 rounded-lg shadow-sm hover:shadow-md transition bg-[#fafafa]"
              >
                <p className="text-lg font-semibold mb-2">{item.source_name}</p>
                <p className="text-sm text-gray-700">
                  Total Earnings: <span className="font-bold">${item.total_amount?.toFixed(2)}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Payouts: {item.payout_count}
                </p>
                <p className="text-sm text-gray-500">
                  Active: {item.first_payment} → {item.last_payment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
