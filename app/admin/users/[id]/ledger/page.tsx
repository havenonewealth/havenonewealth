'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'
import type { AdminUserOverview, RecentPayout } from '@/lib/supabase/admin'

export default function UserPayoutLedgerPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const supabase = createClient()

    const userId = params.id

    const [user, setUser] = useState<AdminUserOverview | null>(null)
    const [ledger, setLedger] = useState<RecentPayout[]>([])
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)

        // load user overview
        const { data: userData } = await supabase
            .from('v_admin_user_overview')
            .select('*')
            .eq('user_id', userId)
            .single()

        setUser(userData || null)

        // load payout ledger
        const { data: ledgerData } = await supabase
            .from('payouts')
            .select(`
        id,
        amount,
        status,
        payment_date,
        notes,
        source_id,
        income_sources ( source_name )
      `)
            .eq('user_id', userId)
            .order('payment_date', { ascending: false })

        const mapped = (ledgerData || []).map((p: any) => ({
            id: p.id,
            user_id: userId,
            user_email: userData?.email || '',
            source_id: p.source_id,
            source_name: p.income_sources?.source_name || '',
            amount: Number(p.amount),
            status: p.status,
            payout_date: p.payment_date,
            notes: p.notes
        })) as RecentPayout[]

        setLedger(mapped)
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [])

    if (loading) {
        return <div className="p-10">Loading…</div>
    }

    if (!user) {
        return <div className="p-10 text-red-600">User not found.</div>
    }

    return (
        <div className="p-10 max-w-5xl mx-auto">

            {/* Back button */}
            <button
                onClick={() => router.push('/admin-dashboard')}
                className="mb-6 px-4 py-2 bg-gray-200 text-[#0A1E2D] rounded-md font-medium hover:bg-gray-300"
            >
                ← Back to Admin Dashboard
            </button>

            {/* User header */}
            <AdminUserHeader user={user} />

            <h2 className="text-2xl font-semibold mt-8 mb-4">Payout Ledger</h2>

            <div className="bg-white shadow-sm border rounded-lg p-6">
                {ledger.length === 0 ? (
                    <p className="text-gray-600">No payout records found.</p>
                ) : (
                    <table className="min-w-full">
                        <thead className="text-left text-sm text-gray-600 bg-gray-50">
                            <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Source</th>
                                <th className="p-3">Amount</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Notes</th>
                            </tr>
                        </thead>

                        <tbody>
                            {ledger.map((p) => (
                                <tr key={p.id} className="border-b">
                                    <td className="p-3">{p.payout_date || '—'}</td>
                                    <td className="p-3">{p.source_name}</td>
                                    <td className="p-3 font-semibold">${p.amount.toLocaleString()}</td>
                                    <td className="p-3">{p.status}</td>
                                    <td className="p-3">{p.notes || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    )
}
