'use client'

import type { Payout } from '@/lib/types'

interface Props {
  payouts: Payout[]
  setFilteredPayouts: (payouts: Payout[]) => void
}

export default function PayoutsFilters({ payouts, setFilteredPayouts }: Props) {
  const uniqueSources = Array.from(new Set(payouts.map(p => p.source_name)))
  const uniqueStatuses = Array.from(new Set(payouts.map(p => p.status)))

  function handleSourceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    if (value === 'all') {
      setFilteredPayouts(payouts)
    } else {
      setFilteredPayouts(payouts.filter(p => p.source_name === value))
    }
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value
    if (value === 'all') {
      setFilteredPayouts(payouts)
    } else {
      setFilteredPayouts(payouts.filter(p => p.status === value))
    }
  }

  return (
    <div className="flex gap-4">
      {/* Source dropdown */}
      <select
        className="p-2 border rounded"
        onChange={handleSourceChange}
        defaultValue="all"
      >
        <option value="all">All Sources</option>
        {uniqueSources.map(src => (
          <option key={src} value={src}>
            {src}
          </option>
        ))}
      </select>

      {/* Status dropdown */}
      <select
        className="p-2 border rounded"
        onChange={handleStatusChange}
        defaultValue="all"
      >
        <option value="all">All Statuses</option>
        {uniqueStatuses.map(status => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </select>
    </div>
  )
}
