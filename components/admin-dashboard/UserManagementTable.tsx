'use client'

import React from 'react'
import { AdminUserOverview } from '@/lib/supabase/admin'

interface Props {
  users: AdminUserOverview[]
}

export default function UserManagementTable({ users }: Props) {
  const money = (n: number) =>
    `$${n.toLocaleString('en-US', { minimumFractionDigits: 2 })}`

  const formatDate = (d: string | null) =>
    d ? new Date(d).toLocaleDateString() : '—'

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-200 rounded-lg">
        <thead className="bg-[#f9f7f3] text-sm">
          <tr>
            <th className="p-3 text-left">Email</th>
            <th className="p-3 text-left">Role</th>
            <th className="p-3 text-left">Lifetime Earned</th>
            <th className="p-3 text-left">Sources</th>
            <th className="p-3 text-left">Payouts</th>
            <th className="p-3 text-left">Joined</th>
            <th className="p-3 text-left">Last Payout</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u, idx) => (
            <tr key={idx} className="border-t hover:bg-[#fdfbf7]">
              <td className="p-3">{u.email}</td>
              <td className="p-3 capitalize">{u.role ?? 'user'}</td>
              <td className="p-3 font-medium">{money(u.lifetime_earned)}</td>
              <td className="p-3">{u.total_sources}</td>
              <td className="p-3">{u.total_payouts}</td>
              <td className="p-3">{formatDate(u.joined_date)}</td>
              <td className="p-3">{formatDate(u.last_payout_date)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
