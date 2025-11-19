'use client'

interface AdminKPIProps {
  title: string
  value: number | string
  sub?: string
}

export default function KPI({ title, value, sub }: AdminKPIProps) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>

      <p className="text-2xl font-bold mt-2">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>

      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  )
}
