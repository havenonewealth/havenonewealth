'use client'

import { useEffect, useState } from 'react'
import { IncomeSource, PortfolioAggregate, MonthlyTrend } from '@/lib/types'

import { getAdminPortfolioAggregates, getAdminMonthlyTrends } from '@/lib/supabase/admin'
import { getSources } from '@/lib/supabase/sources'

import SourcesList from '@/components/sources/SourcesList'
import SourceAnalyticsChart from '@/components/sources/SourceAnalyticsChart'

export default function SourcesPage() {
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [aggregates, setAggregates] = useState<PortfolioAggregate[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const s = await getSources()
      const a = await getAdminPortfolioAggregates()
      const t = await getAdminMonthlyTrends()

      setSources(s)
      setAggregates(a)
      setTrends(t)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="p-10">Loading...</div>

  return (
    <div className="max-w-7xl mx-auto p-10">

      <h1 className="text-3xl font-semibold mb-10">Income Sources</h1>

      {/* ------------------------------- */}
      {/*     Sources List Table          */}
      {/* ------------------------------- */}
      <div className="mb-16">
        <h2 className="text-xl font-semibold mb-4">All Sources</h2>
        <SourcesList sources={sources} aggregates={aggregates} />
      </div>

      {/* ------------------------------- */}
      {/*     Analytics Visualization     */}
      {/* ------------------------------- */}
      <div className="mb-16">
        <h2 className="text-xl font-semibold mb-4">Source Performance</h2>
        <SourceAnalyticsChart aggregates={aggregates} trends={trends} />
      </div>
    </div>
  )
}
