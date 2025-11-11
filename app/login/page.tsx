'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [redirecting, setRedirecting] = useState(false)

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

      // Ensure user exists in custom users table
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

// Post-login role-based redirect (debug version)
useEffect(() => {
  const checkUserAndRedirect = async () => {
    console.log('%c[DEBUG] Starting role check...', 'color: #C6A664; font-weight: bold;')

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) console.error('[DEBUG] Error fetching user:', userError)
    if (!user) {
      console.warn('[DEBUG] No user session found yet. Retrying...')
      return
    }

    console.log('[DEBUG] Supabase user:', user)
    console.log('[DEBUG] Email:', user.email)

    setRedirecting(true)

    const { data: roleData, error } = await supabase
      .from('users')
      .select('role')
      .eq('email', user.email)
      .single()

    console.log('[DEBUG] Role query result:', roleData)
    if (error) console.error('[DEBUG] Role lookup error:', error)

    if (!roleData) {
      console.warn('[DEBUG] No matching user found in public.users, defaulting to /dashboard')
      router.push('/dashboard')
      return
    }

    if (roleData.role === 'admin') {
      console.log('%c[DEBUG] Redirecting to /admin-dashboard', 'color: #00b300; font-weight: bold;')
      router.push('/admin-dashboard')
    } else {
      console.log('%c[DEBUG] Redirecting to /dashboard', 'color: #0099ff; font-weight: bold;')
      router.push('/dashboard')
    }
  }

  // Give Supabase time to hydrate session after magic link redirect
  const timeout = setTimeout(() => checkUserAndRedirect(), 1200)

  supabase.auth.onAuthStateChange((event) => {
    console.log('[DEBUG] Auth state changed:', event)
    if (event === 'SIGNED_IN') {
      console.log('[DEBUG] Detected SIGNED_IN event, triggering role check...')
      setTimeout(() => checkUserAndRedirect(), 500)
    }
  })

  return () => clearTimeout(timeout)
}, [router])



  if (redirecting) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-10 w-10 text-[#C6A664] mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8z"
            ></path>
          </svg>
          <p className="text-lg font-semibold">Signing you in…</p>
          <p className="text-sm text-gray-500 mt-1">Please wait a moment</p>
        </div>
      </main>
    )
  }

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
