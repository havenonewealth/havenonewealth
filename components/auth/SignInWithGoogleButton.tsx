'use client'

import { createClient } from '@/lib/supabaseClient'

export default function SignInWithGoogleButton() {
    const supabase = createClient()

    const handleGoogleLogin = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })

        if (error) {
            console.error('Google login error:', error)
            alert('Unable to sign in with Google')
        }
    }

    return (
        <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-700 font-medium hover:bg-gray-100 transition"
        >
            <img
                src="https://www.gstatic.com/images/branding/product/1x/gsa_64dp.png"
                alt="Google"
                className="h-5 w-5"
            />
            <span>Sign in with Google</span>
        </button>
    )
}
