'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export default function LoginPage() {
    const router = useRouter()
    const supabase = createPagesBrowserClient()

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [redirecting, setRedirecting] = useState(false)

    // -----------------------------------------------------
    // SEND MAGIC LINK + ENSURE USER ROW EXISTS
    // -----------------------------------------------------
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            setMessage('Error sending magic link: ' + error.message)
            setLoading(false)
            return
        }

        setMessage('Check your email for a sign-in link.')

        // Create user entry in public.users if missing
        const { data: existing } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .maybeSingle()

        if (!existing) {
            await supabase.from('users').insert([{ email, role: 'user' }])
        }

        setLoading(false)
    }

    // -----------------------------------------------------
    // ROLE-BASED REDIRECT AFTER MAGIC LINK COMPLETES
    // -----------------------------------------------------
    useEffect(() => {
        const sub = supabase.auth.onAuthStateChange(async (event, session) => {
            if (event !== 'SIGNED_IN' || !session) return

            setRedirecting(true)

            const { data: profile } = await supabase
                .from('users')
                .select('role')
                .eq('email', session.user.email)
                .single()

            if (profile?.role === 'admin') {
                router.push('/admin-dashboard')
            } else {
                router.push('/dashboard')
            }
        })

        return () => {
            sub.data.subscription.unsubscribe()
        }
    }, [router, supabase])

    // -----------------------------------------------------
    // REDIRECTING STATE
    // -----------------------------------------------------
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

    // -----------------------------------------------------
    // LOGIN FORM
    // -----------------------------------------------------
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
            <div className="bg-white p-8 rounded-xl shadow-md w-[90%] max-w-[400px]">

                <h1 className="text-2xl font-semibold text-center mb-2">Haven One Wealth</h1>
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
