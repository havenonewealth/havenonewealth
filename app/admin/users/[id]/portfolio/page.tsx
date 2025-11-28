'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { getAdminUserOverview } from '@/lib/supabase/admin'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'

interface PortfolioSource {
    id: string
    source_name: string
    total_earned: number
    payout_count: number
}

export default function UserPortfolioPage() {
    const { id } = useParams()
    const supabase = createClient()

    const [user, setUser] = useState<any>(null)
    const [sources, setSources] = useState<PortfolioSource[]>([])
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)

        // Load user info
        const users = await getAdminUserOverview()
        const match = users.find(u => u.user_id === id)
        setUser(match || null)

        // Load portfolio breakdown
        const { data } = await supabase
            .from('v_admin_earnings_by_source')
            .select('*')
            .eq('user_id', id)
            .order('total_earned', { ascending: false })

        setSources(data as PortfolioSource[] || [])
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [id])

    if (loading || !user) {
        return <div className="p-10 text-gray-500">Loading portfolio…</div>
    }

    return (
        <div className="p-10 max-w-5xl mx-auto">
            <AdminUserHeader user={user} />

            <h2 className="text-2xl font-semibold mt-10 mb-4">Earnings by Source</h2>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100 text-gray-700 text-sm">
                        <tr>
                            <th className="p-3 text-left">Source</th>
                            <th className="p-3 text-left">Total Earned</th>
                            <th className="p-3 text-left">Payout Count</th>
                        </tr>
                    </thead>

                    <tbody>
                        {sources.map((src: PortfolioSource) => (
                            <tr key={src.id} className="border-b">
                                <td className="p-3">{src.source_name}</td>
                                <td className="p-3">${src.total_earned.toLocaleString()}</td>
                                <td className="p-3">{src.payout_count}</td>
                            </tr>
                        ))}

                        {sources.length === 0 && (
                            <tr>
                                <td className="p-6 text-gray-500 text-center" colSpan={3}>
                                    No earnings recorded
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
