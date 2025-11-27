'use client'

import { money } from '@/lib/utils'
import { RecentPayout } from '@/lib/supabase/admin'

export default function RecentPayoutsTable({ payouts }: { payouts: RecentPayout[] }) {
  if (!payouts || payouts.length === 0) {
    return <p className="text-gray-500 p-4">No payout activity found.</p>
  }

  const formatStatus = (s: string) => {
    const base = 'px-2 py-1 text-xs rounded-full font-semibold'
    if (s === 'paid') return base + ' bg-green-100 text-green-700'
    if (s === 'pending') return base + ' bg-yellow-100 text-yellow-700'
    return base + ' bg-red-100 text-red-700'
  }

  const formatDate = (d: string) => {
    const date = new Date(d)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Source</th>
            <th className="p-3 text-left">User</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
            <th className="p-3 text-left">Payout Date</th>
            <th className="p-3 text-left">Notes</th>
          </tr>
        </thead>

        <tbody>
          {payouts.map((p, idx) => (
            <tr key={idx} className="border-b hover:bg-gray-50">
              <td className="p-3">{p.source_name}</td>
              <td className="p-3">{p.user_email}</td>
              <td className="p-3">{money(p.amount)}</td>
              <td className="p-3">
                <span className={formatStatus(p.status)}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </td>
              <td className="p-3">{formatDate(p.payout_date)}</td>
              <td className="p-3 text-gray-600">{p.notes ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
