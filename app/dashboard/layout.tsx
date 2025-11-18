'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  const [userRole, setUserRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function validate() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      setUserRole(data?.role || null)
      setLoading(false)
    }

    validate()
  }, [router])

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen text-[#0A1E2D]">
        <div>Loading...</div>
      </main>
    )
  }

  const tabStyle = (path: string) =>
    pathname.startsWith(path)
      ? 'bg-[#C6A664] text-[#0A1E2D]'
      : 'bg-gray-200 text-gray-800'

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] text-[#0A1E2D] px-6 py-10 font-[Lato]">
      <div className="max-w-6xl mx-auto bg-white p-10 rounded-2xl shadow-md border border-gray-100">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <Image src="/HOW2Logo.png" width={150} height={50} alt="Haven One Wealth Logo" />

          <div className="flex gap-3">

            <button
              onClick={() => router.push('/dashboard/sources')}
              className={`px-4 py-2 rounded-md font-semibold ${tabStyle('/dashboard/sources')}`}
            >
              Sources
            </button>

            <button
              onClick={() => router.push('/dashboard/payouts')}
              className={`px-4 py-2 rounded-md font-semibold ${tabStyle('/dashboard/payouts')}`}
            >
              Payouts
            </button>

            <button
              onClick={() => router.push('/dashboard/analytics')}
              className={`px-4 py-2 rounded-md font-semibold ${tabStyle('/dashboard/analytics')}`}
            >
              Analytics
            </button>

            {userRole === 'admin' && (
              <button
                onClick={() => router.push('/admin-dashboard')}
                className="px-4 py-2 font-semibold bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664] transition"
              >
                Admin
              </button>
            )}

            <button
              onClick={handleLogout}
              className="px-4 py-2 font-semibold bg-[#0A1E2D] text-white rounded-md hover:bg-[#C6A664] transition"
            >
              Logout
            </button>
          </div>
        </div>

        {/* CHILD PAGES */}
        {children}
      </div>
    </main>
  )
}
