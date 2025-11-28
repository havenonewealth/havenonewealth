'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabaseClient'
import { getAdminUserOverview } from '@/lib/supabase/admin'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'

interface LedgerEntry {
    id: string
    amount: number
    payment_date: string
    status: string
}

export default function UserLedgerPage() {
    const { id } = useParams()
    const supabase = createClient()

    const [user, setUser] = useState<any>(null)
    const [ledger, setLedger] = useState<LedgerEntry[]>([])
    const [loading, setLoading] = useState(true)

    async function load() {
        setLoading(true)

        // Fetch user overview (same dataset as admin user table)
        const users = await getAdminUserOverview()
        const match = users.find(u => u.user_id === id)
        setUser(match || null)

        // Fetch payout ledger
        const { data: payouts } = await supabase
            .from('payouts')
            .select('id, amount, payment_date, status')
            .eq('user_id', id)
            .order('payment_date', { ascending: false })

        setLedger(payouts as LedgerEntry[] || [])
        setLoading(false)
    }

    useEffect(() => {
        load()
    }, [id])

    if (loading || !user) {
        return <div className="p-10 text-gray-500">Loading ledger…</div>
    }

    return (
        <div className="p-10 max-w-5xl mx-auto">
            <AdminUserHeader user={user} />

            <h2 className="text-2xl font-semibold mt-10 mb-4">Payout Ledger</h2>

            <div className="bg-white border rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full">
                    <thead className="bg-gray-100 text-gray-700 text-sm">
                        <tr>
                            <th className="p-3 text-left">Amount</th>
                            <th className="p-3 text-left">Payment Date</th>
                            <th className="p-3 text-left">Status</th>
                        </tr>
                    </thead>

                    <tbody>
                        {ledger.map((p: LedgerEntry) => (
                            <tr key={p.id} className="border-b">
                                <td className="p-3">${p.amount.toLocaleString()}</td>
                                <td className="p-3">{p.payment_date}</td>
                                <td className="p-3">{p.status}</td>
                            </tr>
                        ))}

                        {ledger.length === 0 && (
                            <tr>
                                <td className="p-6 text-gray-500 text-center" colSpan={3}>
                                    No payouts recorded
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
