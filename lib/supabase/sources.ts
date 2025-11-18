import { supabase } from '@/lib/supabaseClient'
import { IncomeSource, PortfolioAggregate, MonthlyTrend } from '@/lib/types'

export async function getSources(): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from('income_sources')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading sources', error)
    return []
  }

  return data as IncomeSource[]
}

export async function getSourceAggregates(): Promise<PortfolioAggregate[]> {
  const { data, error } = await supabase
    .from('v_admin_portfolio_aggregates')
    .select('*')

  if (error) {
    console.error('Error loading aggregates', error)
    return []
  }

  return data as PortfolioAggregate[]
}

export async function getSourceTrends(): Promise<MonthlyTrend[]> {
  const { data, error } = await supabase
    .from('v_admin_monthly_trends')
    .select('*')

  if (error) {
    console.error('Error loading source trends', error)
    return []
  }

  return data as MonthlyTrend[]
}
