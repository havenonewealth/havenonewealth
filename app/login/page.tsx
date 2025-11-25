'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Handle login with password
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError
      if (!authData.user) throw new Error('Authentication failed.')

      // Ensure user exists in the custom "users" table
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('email', email)
        .maybeSingle()

      if (!existingUser) {
        // Create user record with default role = user
        const { error: insertError } = await supabase
          .from('users')
          .insert([{ email, role: 'user' }])

        if (insertError) throw insertError
      }

      // Fetch role for redirect
      const { data: roleData, error: roleErr } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single()

      if (roleErr) throw roleErr

      if (roleData.role === 'admin') {
        router.push('/admin-dashboard')
      } else {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setMessage(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
      <div className="bg-white p-8 rounded-xl shadow-md w-[90%] max-w-[400px]">
        <h1 className="text-2xl font-semibold text-center mb-2">
          Haven One Wealth
        </h1>
        <p className="text-center mb-6">Sign in with your account</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md"
          />

          <input
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="p-2 border border-gray-300 rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-[#C6A664] text-[#0A1E2D] font-semibold py-2 rounded-md hover:bg-[#b59655] transition disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        {message && (
          <p className="mt-3 text-center text-sm text-red-600">{message}</p>
        )}
      </div>
    </main>
  )
}
