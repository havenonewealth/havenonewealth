'use client'

import type { AdminUserOverview } from '@/lib/supabase/admin'

interface Props {
    user: AdminUserOverview
}

export default function AdminUserHeader({ user }: Props) {
    return (
        <div className="bg-white border rounded-xl shadow-sm p-6">

            <div className="flex justify-between items-center flex-wrap gap-6">

                {/* LEFT SIDE — USER SUMMARY */}
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900">
                        {user.email}
                    </h1>

                    <p className="text-gray-600 text-sm mt-1">
                        Role: <span className="font-medium">{user.role || 'Earner'}</span>
                    </p>

                    <p className="text-gray-600 text-sm">
                        Joined: <span className="font-medium">{user.joined_date}</span>
                    </p>

                    <p className="text-gray-600 text-sm">
                        Last Payout:{' '}
                        <span className="font-medium">
                            {user.last_payout_date || 'None'}
                        </span>
                    </p>
                </div>

                {/* RIGHT SIDE — KEY METRICS */}
                <div className="flex gap-12">

                    <div className="text-right">
                        <p className="text-sm text-gray-600">Lifetime Earned</p>
                        <p className="text-xl font-bold">
                            ${user.lifetime_earned.toLocaleString()}
                        </p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-600">Total Payouts</p>
                        <p className="text-xl font-bold">{user.total_payouts}</p>
                    </div>

                    <div className="text-right">
                        <p className="text-sm text-gray-600">Sources</p>
                        <p className="text-xl font-bold">{user.total_sources}</p>
                    </div>

                </div>
            </div>
        </div>
    )
}
