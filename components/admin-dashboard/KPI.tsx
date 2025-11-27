'use client'

import { money } from '@/lib/utils'

interface AdminKPIProps {
  title: string
  value: number | string
  sub?: string
  isMoney?: boolean // NEW FLAG
}

export default function KPI({ title, value, sub, isMoney = false }: AdminKPIProps) {
  const formatted =
    isMoney && typeof value === 'number'
      ? money(value)
      : typeof value === 'number'
        ? value.toLocaleString()
        : value

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-sm font-semibold text-gray-500">{title}</h3>

      <p className="text-2xl font-bold mt-2 text-[#0A1E2D]">
        {formatted}
      </p>

      {sub && (
        <p className="text-xs text-gray-500 mt-1">{sub}</p>
      )}
    </div>
  )
}
