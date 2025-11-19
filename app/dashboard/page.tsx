'use client'

import { useEffect, useRef, useState } from 'react'
import { useTabs } from './TabContext'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import * as echarts from 'echarts'
import { CSVLink } from 'react-csv'

// -------------------------
// TYPES
// -------------------------
interface IncomeSource {
  id: string
  source_name: string
  source_type?: string
  frequency?: string
  expected_amount?: number
}

interface Payout {
  id: string
  amount: number
  payment_date: string
  status: string
  income_sources?: {
    source_name?: string
  } | null
}

interface AnalyticsRow {
  month: string
  total_payout: number
  total_payments: number
}

// -------------------------

export default function DashboardPage() {
  const router = useRouter()
  const { activeTab } = useTabs()

  // FIX: Add proper types to avoid never[]
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [analytics, setAnalytics] = useState<AnalyticsRow[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // FIX: Properly type chart refs
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const formatCurrency = (v: number | undefined): string =>
    v ? v.toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : '$0.00'

  // -------------------------
  // LOAD DATA
  // -------------------------
  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const [src, pay, ana] = await Promise.all([
        supabase.from('income_sources').select('*').eq('user_id', user.id),
        supabase
          .from('payouts')
          .select('*, income_sources(source_name)')
          .eq('user_id', user.id),
        supabase.rpc('get_user_monthly_trends', { uid: user.id })
      ])

      setSources((src.data ?? []) as IncomeSource[])
      setPayouts((pay.data ?? []) as Payout[])
      setAnalytics((ana.data ?? []) as AnalyticsRow[])

      setLoading(false)
    }

    load()
  }, [router])

  // -------------------------
  // ANALYTICS CHART
  // -------------------------
  useEffect(() => {
    if (activeTab !== 'analytics') return
    if (!analytics.length) return
    if (!chartRef.current) return

    if (!chartInstance.current) {
      chartInstance.current = echarts.init(chartRef.current)
    }

    const chart = chartInstance.current

    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['Total Payout', 'Payments'] },
      xAxis: {
        type: 'category',
        data: analytics.map((a: AnalyticsRow) => a.month)
      },
      yAxis: [
        { type: 'value', name: 'Total Payout' },
        { type: 'value', name: 'Payments', position: 'right' }
      ],
      series: [
        {
          name: 'Total Payout',
          type: 'bar',
          data: analytics.map((a: AnalyticsRow) => a.total_payout),
          itemStyle: { color: '#C6A664' }
        },
        {
          name: 'Payments',
          type: 'line',
          yAxisIndex: 1,
          data: analytics.map((a: AnalyticsRow) => a.total_payments),
          itemStyle: { color: '#0A1E2D' }
        }
      ]
    }

    chart.setOption(option)

    const resizeHandler = () => chart.resize()
    window.addEventListener('resize', resizeHandler)

    return () => window.removeEventListener('resize', resizeHandler)
  }, [activeTab, analytics])

  // -------------------------
  if (loading) return <div>Loading...</div>

  const csvData = payouts.map((p) => ({
    Source: p.income_sources?.source_name || '—',
    Amount: p.amount,
    Date: p.payment_date,
    Status: p.status
  }))

  // -------------------------
  // RENDER
  // -------------------------
  return (
    <div className="mt-6">

      {/* SOURCES TAB */}
      {activeTab === 'sources' && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Income Sources</h2>

          <ul className="space-y-3">
            {sources.map((s: IncomeSource) => (
              <li key={s.id} className="p-4 border rounded-lg shadow-sm">
                <p className="text-lg font-semibold">{s.source_name}</p>

                <p className="text-sm text-gray-600">
                  {s.source_type && <span>{s.source_type} • </span>}
                  {s.frequency && <span>{s.frequency} • </span>}
                  {formatCurrency(s.expected_amount)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* PAYOUTS TAB */}
      {activeTab === 'payouts' && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Payouts</h2>

          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3">Source</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p: Payout) => (
                  <tr key={p.id} className="border-t">
                    <td className="p-3">{p.income_sources?.source_name || '—'}</td>
                    <td className="p-3">{formatCurrency(p.amount)}</td>
                    <td className="p-3">{new Date(p.payment_date).toLocaleDateString()}</td>
                    <td className="p-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-4">
              <CSVLink
                data={csvData}
                filename={`HavenOne_Payouts_${new Date().toISOString().slice(0, 10)}.csv`}
                className="bg-[#C6A664] px-4 py-2 rounded-md text-[#0A1E2D] font-semibold"
              >
                Export CSV
              </CSVLink>
            </div>
          </div>
        </section>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <section>
          <h2 className="text-2xl font-semibold mb-4">Analytics</h2>

          {analytics.length === 0 ? (
            <p>No analytics data available.</p>
          ) : (
            <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
          )}
        </section>
      )}
    </div>
  )
}
