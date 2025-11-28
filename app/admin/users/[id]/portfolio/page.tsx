'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'

import type { AdminUserOverview } from '@/lib/supabase/admin'

interface UserSourceStat {
    source_id: string
    source_name: string
    total_earned: number
    payout_count: number
    last_payment_date: string | null
}

export default function UserPortfolioPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const supabase = createClient()

    const userId = params.id

    const [user, setUser] = useState<AdminUserOverview | null>(null)
    const [sources, setSources] = useState<UserSourceStat[]>([])
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)

        // Load user profile
        const { data: userData } = await supabase
            .from('v_admin_user_overview')
            .select('*')
            .eq('user_id', userId)
            .single()

        setUser(userData || null)

        // Load earnings by source
        const { data: sourceData } = await supabase
            .from('payouts')
            .select(`
        source_id,
        amount,
        payment_date,
        income_sources ( source_name )
      `)
            .eq('user_id', userId)

        const aggregateMap = new Map<string, UserSourceStat>()

            ; (sourceData || []).forEach((row: any) => {
                const sid = row.source_id
                if (!sid) return

                const existing = aggregateMap.get(sid)

                if (!existing) {
                    aggregateMap.set(sid, {
                        source_id: sid,
                        source_name: row.income_sources?.source_name || '',
                        total_earned: Number(row.amount) || 0,
                        payout_count: 1,
                        last_payment_date: row.payment_date || null
                    })
                } else {
                    existing.total_earned += Number(row.amount) || 0
                    existing.payout_count += 1

                    if (
                        row.payment_date &&
                        (!existing.last_payment_date ||
                            new Date(row.payment_date) > new Date(existing.last_payment_date))
                    ) {
                        existing.last_payment_date = row.payment_date
                    }
                }
            })

        setSources(Array.from(aggregateMap.values()))

        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    if (loading) return <div className="p-10">Loading…</div>

    if (!user) {
        return <div className="p-10 text-red-600">User not found.</div>
    }

    return (
        <div className="p-10 max-w-6xl mx-auto">

            {/* BACK BUTTON */}
            <button
                onClick={() => router.push('/admin-dashboard')}
                className="mb-6 px-4 py-2 bg-gray-200 text-[#0A1E2D] rounded-md font-medium hover:bg-gray-300"
            >
                ← Back to Admin Dashboard
            </button>

            {/* HEADER */}
            <AdminUserHeader user={user} />

            <h2 className="text-2xl font-semibold mt-8 mb-4">Portfolio Overview</h2>

            <div className="bg-white border rounded-xl shadow-sm p-6">
                {sources.length === 0 ? (
                    <p className="text-gray-600">This user has no earning sources yet.</p>
                ) : (
                    <table className="min-w-full">
                        <thead className="bg-gray-50 text-left text-sm text-gray-600">
                            <tr>
                                <th className="p-3">Source</th>
                                <th className="p-3">Total Earned</th>
                                <th className="p-3">Payout Count</th>
                                <th className="p-3">Last Payment</th>
                            </tr>
                        </thead>

                        <tbody>
                            {sources.map((src) => (
                                <tr key={src.source_id} className="border-b">
                                    <td className="p-3 font-medium">{src.source_name}</td>

                                    <td className="p-3 font-semibold">
                                        ${src.total_earned.toLocaleString()}
                                    </td>

                                    <td className="p-3">{src.payout_count}</td>

                                    <td className="p-3">{src.last_payment_date || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    )
}
