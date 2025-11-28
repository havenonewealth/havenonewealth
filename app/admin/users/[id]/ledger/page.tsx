'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import AdminUserHeader from '@/components/admin-dashboard/AdminUserHeader'
import {
    getAdminUserOverview,
    type AdminUserOverview,
    getUserPayoutLedger
} from '@/lib/supabase/admin'

export default function UserLedgerPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [user, setUser] = useState<AdminUserOverview | null>(null)
    const [ledger, setLedger] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const allUsers = await getAdminUserOverview()
            const found = allUsers.find(u => u.user_id === id)
            setUser(found || null)

            const payouts = await getUserPayoutLedger(id)
            setLedger(payouts)

            setLoading(false)
        }
        load()
    }, [id])

    if (loading) return <div className="p-10">Loading ledger...</div>

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
                Payout Ledger
            </h2>

            <div className="border rounded-xl bg-white shadow p-6">
                {ledger.length === 0 && (
                    <p className="text-gray-600">No payouts recorded.</p>
                )}

                {ledger.map(p => (
                    <div
                        key={p.id}
                        className="p-4 mb-4 border rounded bg-gray-50"
                    >
                        <p className="font-semibold">
                            ${p.amount.toLocaleString()}
                        </p>
                        <p className="text-gray-700">Date: {p.payment_date}</p>
                        <p className="text-gray-700">Status: {p.status}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}
