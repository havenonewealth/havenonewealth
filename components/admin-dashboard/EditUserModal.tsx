'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabaseClient'
import { AdminUserOverview } from '@/lib/supabase/admin'

interface Props {
    open: boolean
    setOpen: (v: boolean) => void
    user: AdminUserOverview | null
    onUpdated: () => void
}

export default function EditUserModal({ open, setOpen, user, onUpdated }: Props) {
    const supabase = createClient()

    const [email, setEmail] = useState('')
    const [role, setRole] = useState('earner')
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setEmail(user.email)
            setRole(user.role || 'earner')
        }
    }, [user])

    if (!open || !user) return null

    async function handleSave() {
        if (!user) return      // Safety check (fix error)

        setError('')
        setSuccess(false)
        setLoading(true)

        const { error: updateError } = await supabase
            .from('users')
            .update({ email, role })
            .eq('id', user.user_id)

        setLoading(false)

        if (updateError) {
            setError(updateError.message)
            return
        }

        setSuccess(true)
        onUpdated()

        setTimeout(() => {
            setOpen(false)
            setSuccess(false)
        }, 1000)
    }

    async function handleDisable() {
        if (!user) return       // Safety check (fix error)

        setError('')
        setLoading(true)

        const { error: disableError } = await supabase
            .from('users')
            .update({ role: 'disabled' })
            .eq('id', user.user_id)

        setLoading(false)

        if (disableError) {
            setError(disableError.message)
            return
        }

        onUpdated()
        setOpen(false)
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg w-[420px] p-6">

                <h2 className="text-xl font-semibold mb-4">Edit User</h2>

                <div className="space-y-4">

                    <div>
                        <label className="text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium">Role</label>
                        <select
                            className="w-full border rounded-md px-3 py-2 mt-1"
                            value={role}
                            onChange={e => setRole(e.target.value)}
                        >
                            <option value="earner">Earner</option>
                            <option value="admin">Admin</option>
                            <option value="disabled" className="text-red-600">Disabled</option>
                        </select>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    {success && <p className="text-green-600 text-sm">User updated</p>}

                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={handleDisable}
                            className="text-red-600 underline text-sm"
                        >
                            Disable User
                        </button>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setOpen(false)}
                                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSave}
                                disabled={loading}
                                className="px-4 py-2 rounded-md bg-[#0A1E2D] text-white font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    )
}
