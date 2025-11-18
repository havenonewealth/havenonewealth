import React from 'react'
import { Payout } from '@/lib/supabase/payouts'

interface Props {
  payouts: Payout[]
}

export default function PayoutsTable({ payouts }: Props) {
  return (
    <table className="min-w-full text-sm">
      <thead>
        <tr className="border-b text-left text-gray-600">
          <th className="py-3">Source</th>
          <th className="py-3">Amount</th>
          <th className="py-3">Status</th>
          <th className="py-3">Payout Date</th>
        </tr>
      </thead>

      <tbody>
        {payouts.map((p, i) => (
          <tr key={i} className="border-b hover:bg-gray-50">
            <td className="py-3">{p.source_name}</td>

            <td className="py-3 font-medium">
              ${p.amount.toLocaleString()}
            </td>

            <td className="py-3">
              <span
                className={
                  p.status === 'paid'
                    ? 'text-green-600'
                    : p.status === 'pending'
                    ? 'text-yellow-600'
                    : 'text-red-600'
                }
              >
                {p.status}
              </span>
            </td>

            <td className="py-3">
              {p.payout_date ? new Date(p.payout_date).toLocaleDateString() : 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
