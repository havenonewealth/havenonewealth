'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'

import {
    getAdminUserOverview,
    type AdminUserOverview,
    getUserPortfolio
} from '@/lib/supabase/admin'

export default function UserPortfolioPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const supabase = createClient()

    const [user, setUser] = useState<AdminUserOverview | null>(null)
    const [sources, setSources] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const allUsers = await getAdminUserOverview()
            const found = allUsers.find(u => u.user_id === id)
            setUser(found || null)

            const src = await getUserPortfolio(id)
            setSources(src)

            setLoading(false)
        }
        load()
    }, [id])

    if (loading) return <div className="p-10">Loading portfolio...</div>

    if (!user) {
        return (
            <div className="p-10">
                <p className="text-red-600 font-semibold mb-4">
                    User not found
                </p>
                <button
                    onClick={() => router.push('/admin')}
                    className="px-4 py-2 bg-gray-200 rounded"
                >
                    Back
                </button>
            </div>
        )
    }

    return (
        <div className="p-10 space-y-10 max-w-5xl mx-auto">
            <button
                onClick={() => router.back()}
                className="px-4 py-2 bg-gray-200 rounded"
            >
                Back
            </button>

            <AdminUserHeader user={user} />

            <h2 className="text-xl font-semibold mt-10 mb-4">
                Income Sources
            </h2>

            <div className="border rounded-xl bg-white shadow p-6">
                {sources.length === 0 && (
                    <p className="text-gray-600">No sources assigned.</p>
                )}

                {sources.length > 0 && (
                    <div className="grid grid-cols-2 gap-6">
                        {sources.map(src => (
                            <div
                                key={src.id}
                                className="p-4 border rounded bg-gray-50"
                            >
                                <p className="font-semibold text-lg">
                                    {src.source_name}
                                </p>
                                <p className="text-gray-700">
                                    Total Earned: ${src.total_earned.toLocaleString()}
                                </p>
                                <p className="text-gray-700">
                                    Payout Count: {src.payout_count}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
