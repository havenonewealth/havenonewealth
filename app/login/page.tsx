'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
    const router = useRouter()

    // Create a NEW browser client (NOT deprecated)
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [redirecting, setRedirecting] = useState(false)

    // -----------------------------------------------------
    // MAGIC LINK LOGIN
    // -----------------------------------------------------
    const handleMagicLink = async (e: React.FormEvent) => {
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

        // Ensure user row exists
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
    // GOOGLE LOGIN
    // -----------------------------------------------------
    const handleGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            console.error('Google login error:', error)
            setMessage('Google login failed: ' + error.message)
        }
    }

    // -----------------------------------------------------
    // LISTEN FOR SIGN-IN EVENTS
    // -----------------------------------------------------
    useEffect(() => {
        const { data: authListener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event !== 'SIGNED_IN' || !session) return

                setRedirecting(true)

                // Fetch user role
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
            }
        )

        return () => {
            authListener.subscription.unsubscribe()
        }
    }, [router, supabase])

    // -----------------------------------------------------
    // REDIRECTING UI
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
    // LOGIN UI
    // -----------------------------------------------------
    return (
        <main className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa] text-[#0A1E2D]">
            <div className="bg-white p-8 rounded-xl shadow-md w-[90%] max-w-[400px]">
                <h1 className="text-2xl font-semibold text-center mb-2">Haven One Wealth</h1>
                <p className="text-center mb-6">Sign in to continue</p>

                {/* MAGIC LINK */}
                <form onSubmit={handleMagicLink} className="flex flex-col gap-3 mb-6">
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

                {/* GOOGLE LOGIN */}
                <button
                    onClick={handleGoogle}
                    className="w-full mt-4 bg-[#0A1E2D] text-white py-2 rounded-md font-semibold hover:bg-black transition"
                >
                    Continue with Google
                </button>

                {message && <p className="mt-3 text-center text-sm">{message}</p>}
            </div>
        </main>
    )
}
