'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'

interface Props {
    open: boolean
    setOpen: (v: boolean) => void
    onCreated: () => void
}

export default function CreateUserModal({ open, setOpen, onCreated }: Props) {
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [role, setRole] = useState('earner')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Reset form every time the modal opens
    useEffect(() => {
        if (open) {
            setEmail('')
            setRole('earner')
            setLoading(false)
            setError('')
            setSuccess(false)
        }
    }, [open])

    if (!open) return null

    async function handleCreate() {
        setError('')
        setSuccess(false)

        if (!email.trim()) {
            setError('Email is required.')
            return
        }

        setLoading(true)

        const { error: signUpError } = await supabase.auth.admin.createUser({
            email,
            email_confirm: true,
            user_metadata: { role }
        })

        setLoading(false)

        if (signUpError) {
            setError(signUpError.message)
            return
        }

        setSuccess(true)
        onCreated()

        // Close gracefully after success
        setTimeout(() => {
            setOpen(false)
        }, 1200)
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[420px] p-6">

                <h2 className="text-xl font-semibold mb-4">Create New User</h2>

                <div className="space-y-4">

                    {/* Email */}
                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            placeholder="user@domain.com"
                            autoFocus
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="text-sm font-medium">Role</label>
                        <select
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="earner">Earner</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    {/* Error / Success */}
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">User created successfully</p>}

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setOpen(false)}
                            className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button
                            disabled={loading || !email}
                            onClick={handleCreate}
                            className="px-4 py-2 rounded-md bg-[#0A1E2D] text-white font-semibold disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    )
}
