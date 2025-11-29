'use client'

import { useState, useEffect } from 'react'

interface Props {
    open: boolean
    setOpen: (v: boolean) => void
    onCreated: () => void
}

export default function CreateUserModal({ open, setOpen, onCreated }: Props) {

    const [email, setEmail] = useState('')
    const [role, setRole] = useState('earner')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    // Reset modal fields each time it opens
    useEffect(() => {
        if (open) {
            setEmail('')
            setRole('earner')
            setError('')
            setSuccess(false)
            setLoading(false)
        }
    }, [open])

    if (!open) return null

    async function handleCreate() {
        setError('')
        setSuccess(false)

        // Basic email validation
        if (!email.trim() || !email.includes('@')) {
            setError('Please enter a valid email address.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create_user`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
                    },
                    body: JSON.stringify({ email, role })
                }
            )

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Failed to create user.')
                setLoading(false)
                return
            }

            setSuccess(true)
            onCreated()

            // Close after success
            setTimeout(() => {
                setOpen(false)
            }, 1200)

        } catch (err: any) {
            setError(err.message || 'Unexpected error occurred.')
        }

        setLoading(false)
    }

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-[420px] p-6">

                <h2 className="text-xl font-semibold mb-4">Create New User</h2>

                <div className="space-y-4">

                    {/* Email Field */}
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

                    {/* Role Selector */}
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

                    {/* Error */}
                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    {/* Success */}
                    {success && <p className="text-green-600 text-sm">User created successfully</p>}

                    {/* Footer Buttons */}
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
