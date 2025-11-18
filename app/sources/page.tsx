'use client'

import { useEffect, useState } from 'react'

import { getSources, getSourceAggregates, getSourceTrends } from '@/lib/supabase/sources'
import { IncomeSource, PortfolioAggregate, MonthlyTrend } from '@/lib/types'

import SourcesList from '@/components/sources/SourcesList'
import SourceAnalyticsChart from '@/components/sources/SourceAnalyticsChart'

export default function SourcesPage() {
  const [sources, setSources] = useState<IncomeSource[]>([])
  const [aggregates, setAggregates] = useState<PortfolioAggregate[]>([])
  const [trends, setTrends] = useState<MonthlyTrend[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  async function load() {
    setLoading(true)

    const s = await getSources()
    const a = await getSourceAggregates()
    const t = await getSourceTrends()

    console.log("SOURCES →", s)
    console.log("AGGREGATES →", a)
    console.log("TRENDS →", t)

    setSources(s)
    setAggregates(a)
    setTrends(t)
    setLoading(false)
  }

  load()
}, [])


  if (loading) return <div className="p-10">Loading sources...</div>

  return (
    <div className="p-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">Income Sources</h1>

      <div className="mb-12">
        <SourcesList sources={sources} aggregates={aggregates} />
      </div>

      <div className="mb-12">
        <SourceAnalyticsChart aggregates={aggregates} trends={trends} />
      </div>
    </div>
  )
}
