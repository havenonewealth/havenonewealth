'use client'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
export default function Charts({ data }: { data: any[] }) {
  if (!data?.length) return <p className='text-gray-500'>No chart data available.</p>
  const grouped = Object.values(data.reduce((acc: any, p: any) => {
    const month = new Date(p.payment_date).toLocaleString('default', { month: 'short', year: '2-digit' })
    acc[month] = acc[month] || { month, total: 0 }
    acc[month].total += p.amount
    return acc
  }, {}))
  return (
    <ResponsiveContainer width='100%' height={350}>
      <LineChart data={grouped}>
        <CartesianGrid strokeDasharray='3 3' />
        <XAxis dataKey='month' />
        <YAxis tickFormatter={(v) => `$${v}`} />
        <Tooltip formatter={(v: any) => `$${v}`} />
        <Line type='monotone' dataKey='total' stroke='#C6A664' strokeWidth={3} dot />
      </LineChart>
    </ResponsiveContainer>
  )
}
