'use client'

interface AdminKPIProps {
  title: string
  value: number | string
  sub?: string
  isMoney?: boolean
}

export default function KPI({ title, value, sub, isMoney = false }: AdminKPIProps) {
  const formatMoney = (n: number | string) => {
    const asNum = typeof n === 'number' ? n : Number(n)
    if (isNaN(asNum)) return n

    return asNum.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatted =
    isMoney ||
      title.toLowerCase().includes('payout') ||
      title.toLowerCase().includes('portfolio')
      ? formatMoney(value)
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
        <p className="text-xs text-gray-500 mt-1">
          {sub}
        </p>
      )}
    </div>
  )
}
