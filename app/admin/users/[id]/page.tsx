'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'
import {
    getAdminUserOverview,
    type AdminUserOverview
} from '@/lib/supabase/admin'

export default function AdminUserMainPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const supabase = createClient()

    const [user, setUser] = useState<AdminUserOverview | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const data = await getAdminUserOverview()
            const found = data.find(u => u.user_id === id)

            setUser(found || null)
            setLoading(false)
        }
        load()
    }, [id])

    if (loading) {
        return <div className="p-10">Loading user...</div>
    }

    if (!user) {
        return (
            <div className="p-10">
                <p className="text-red-600 font-semibold mb-4">
                    User not found
                </p>

                <button
                    onClick={() => router.push('/admin/dashboard')}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Back
                </button>
            </div>
        )
    }

    return (
        <div className="p-10 space-y-10 max-w-6xl mx-auto">
            <div className="flex justify-between">
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Back
                </button>

                <button
                    onClick={() => router.push('/admin-dashboard')}
                    className="px-4 py-2 bg-[#0A1E2D] text-white rounded"
                >
                    Create User
                </button>
            </div>

            <AdminUserHeader user={user} />

            <div className="grid grid-cols-3 gap-8 mt-10">
                <div className="p-6 bg-white border rounded shadow">
                    <h3 className="font-semibold text-lg">Portfolio</h3>
                    <p className="text-gray-600 mt-2">
                        View all income sources assigned to the user.
                    </p>
                    <button
                        onClick={() =>
                            router.push(`/admin/users/${id}/portfolio`)
                        }
                        className="mt-4 px-4 py-2 bg-[#0A1E2D] text-white rounded"
                    >
                        View Portfolio
                    </button>
                </div>

                <div className="p-6 bg-white border rounded shadow">
                    <h3 className="font-semibold text-lg">Payout Ledger</h3>
                    <p className="text-gray-600 mt-2">
                        View all payout activity for this user.
                    </p>
                    <button
                        onClick={() =>
                            router.push(`/admin/users/${id}/ledger`)
                        }
                        className="mt-4 px-4 py-2 bg-[#0A1E2D] text-white rounded"
                    >
                        View Payout Ledger
                    </button>
                </div>
            </div>
        </div>
    )
}
