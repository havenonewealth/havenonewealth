'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { TabProvider, useTabs } from './TabContext'

function Header() {
  const router = useRouter()
  const { activeTab, setActiveTab } = useTabs()

  const tabStyle = (tab: string) =>
    activeTab === tab
      ? 'bg-[#C6A664] text-[#0A1E2D]'
      : 'bg-gray-200 text-gray-800'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex justify-between items-center mb-6">
      <Image src="/HOW2Logo.png" width={150} height={50} alt="Haven One Wealth Logo" />

      <div className="flex gap-3">
        <button onClick={() => setActiveTab('sources')} className={`px-4 py-2 rounded-md font-semibold ${tabStyle('sources')}`}>
          Sources
        </button>

        <button onClick={() => setActiveTab('payouts')} className={`px-4 py-2 rounded-md font-semibold ${tabStyle('payouts')}`}>
          Payouts
        </button>

        <button onClick={() => setActiveTab('analytics')} className={`px-4 py-2 rounded-md font-semibold ${tabStyle('analytics')}`}>
          Analytics
        </button>

        <button
          onClick={handleLogout}
          className="px-4 py-2 font-semibold bg-[#0A1E2D] text-white rounded-md"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validate() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      setLoading(false)
    }

    validate()
  }, [router])

  if (loading) {
    return <main className="flex items-center justify-center min-h-screen">Loading...</main>
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">

        <TabProvider>
          <Header />
          {children}
        </TabProvider>

      </div>
    </main>
  )
}
