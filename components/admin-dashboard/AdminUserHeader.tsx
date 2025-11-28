'use client'

import { AdminUserOverview } from '@/lib/supabase/admin'

export default function AdminUserHeader({ user }: { user: AdminUserOverview }) {
    return (
        <div className="bg-white rounded-xl shadow-sm p-6 border mb-8">
            <h1 className="text-2xl font-semibold">{user.email}</h1>

            <div className="mt-4 grid grid-cols-4 gap-6 text-sm">
                <div>
                    <p className="text-gray-500">Role</p>
                    <p className="font-medium">{user.role}</p>
                </div>

                <div>
                    <p className="text-gray-500">Lifetime Earned</p>
                    <p className="font-medium">${user.lifetime_earned.toLocaleString()}</p>
                </div>

                <div>
                    <p className="text-gray-500">Total Payouts</p>
                    <p className="font-medium">{user.total_payouts}</p>
                </div>

                <div>
                    <p className="text-gray-500">Sources</p>
                    <p className="font-medium">{user.total_sources}</p>
                </div>
            </div>
        </div>
    )
}
