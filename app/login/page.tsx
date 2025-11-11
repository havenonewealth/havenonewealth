'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Send magic link and ensure user record exists
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: 'https://havenonewealth.vercel.app/login' },
      })

      if (error) throw error
      setMessage('Check your email for a sign-in link!')

      // Ensure user exists in the custom "users" table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (!existingUser) {
        await supabase.from('users').insert([{ email, role: 'user' }])
      }
    } catch (err: any) {
      setMessage('Error sending magic link: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  // Post-login role-based redirect
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: roleData, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', user.id)
        .single()

      if (error || !roleData) {
        console.warn('User role not found, defaulting to dashboard')
        router.push('/dashboard')
        return
      }

      if (roleData.role === 'admin') router.push('/admin-dashboard')
      else router.push('/dashboard')
    }

    checkUserAndRedirect()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') checkUserAndRedirect()
    })
  }, [router])

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
      <div className="bg-white p-8 rounded-xl shadow-md w-[90%] max-w-[400px]">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Haven One Wealth
        </h1>
        <p className="text-center mb-6">Sign in via magic link</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655] transition disabled:opacity-50"
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}
      </div>
    </main>
  )
}
