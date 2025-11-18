import { Payout } from '@/lib/types'

interface Props {
  payouts: Payout[]
}

export default function PayoutsTable({ payouts }: Props) {
  return (
    <div className="border rounded-lg p-6 bg-white shadow-sm">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Date</th>
            <th className="py-2 text-left">Source</th>
            <th className="py-2 text-left">Amount</th>
            <th className="py-2 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          {payouts.map((p, i) => (
            <tr key={i} className="border-b">
              <td className="py-2">{new Date(p.payout_date).toLocaleDateString()}</td>
              <td className="py-2">{p.source_name || 'Unknown Source'}</td>
              <td className="py-2">${p.amount.toLocaleString()}</td>
              <td className="py-2">{p.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
