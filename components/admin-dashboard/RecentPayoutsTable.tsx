import { RecentPayout } from '@/lib/types'

interface Props {
  payouts: RecentPayout[]
}

export default function RecentPayoutsTable({ payouts }: Props) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b">
          <th className="p-2 text-left">Source</th>
          <th className="p-2 text-left">Amount</th>
          <th className="p-2 text-left">Status</th>
          <th className="p-2 text-left">Payout Date</th>
        </tr>
      </thead>

      <tbody>
        {payouts.map((p) => (
          <tr key={p.payout_date + p.source_name} className="border-b">
            <td className="p-2">{p.source_name}</td>
            <td className="p-2">${p.amount.toLocaleString()}</td>
            <td className="p-2">{p.status}</td>
            <td className="p-2">{p.payout_date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
