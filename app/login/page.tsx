'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [redirecting, setRedirecting] = useState(false)

  // ---------------------------------------------------------
  // Handle Google Login
  // ---------------------------------------------------------
  const handleGoogleLogin = async () => {
    setLoading(true)

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error(error)
      setMessage('Google login failed.')
    }

    setLoading(false)
  }

  // ---------------------------------------------------------
  // Magic Link Login (optional — keep for fallback)
  // ---------------------------------------------------------
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/login` }
      })

      if (error) throw error
      setMessage('Check your email for a sign-in link!')

      // Ensure user exists in users table
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .maybeSingle()

      if (!existingUser) {
        await supabase.from('users').insert([{ email, role: 'user' }])
      }

    } catch (err: any) {
      setMessage('Error: ' + err.message)
    }

    setLoading(false)
  }

  // ---------------------------------------------------------
  // Auto-redirect when session becomes available
  // ---------------------------------------------------------
  useEffect(() => {
    const sub = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'SIGNED_IN') {
        setRedirecting(true)
        router.push('/login') // temporary hold while callback redirects
      }
    })

    return () => {
      sub.data.subscription.unsubscribe()
    }
  }, [router])

  if (redirecting) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-lg">Signing you in…</p>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
      <div className="bg-white p-8 rounded-xl shadow-md w-[90%] max-w-[400px]">

        <h1 className="text-2xl font-semibold text-center mb-6">
          Haven One Wealth — Login
        </h1>

        {/* Google Login */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-2 mb-6 bg-[#0A1E2D] text-white font-semibold rounded-md hover:bg-black transition"
        >
          Sign in with Google
        </button>

        {/* Divider */}
        <div className="text-center text-sm text-gray-500 mb-4">
          or continue with email
        </div>

        {/* Magic Link */}
        <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
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
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655]"
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}
      </div>
    </main>
  )
}
