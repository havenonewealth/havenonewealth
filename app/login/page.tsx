'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'https://havenonewealth.vercel.app/dashboard' }
    })

    if (error) setMessage('Error sending magic link: ' + error.message)
    else setMessage('Check your email for a sign-in link!')

    setLoading(false)
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
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md"
          >
            {loading ? 'Sending…' : 'Send Magic Link'}
          </button>
        </form>

        {message && <p className="mt-3 text-center text-sm">{message}</p>}
      </div>
    </main>
  )
}
