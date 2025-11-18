import React from 'react'

interface KPIProps {
  title: string
  value: number | string
  sub?: string
}

export default function KPI({ title, value, sub }: KPIProps) {
  return (
    <div className="bg-white border rounded-xl p-6 shadow-sm">
      <div className="text-sm text-gray-500 mb-1">{title}</div>
      <div className="text-3xl font-semibold text-gray-900 tracking-tight">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {sub && <div className="text-sm text-gray-500 mt-1">{sub}</div>}
    </div>
  )
}
