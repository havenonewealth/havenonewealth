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
    .from('v_user_payout_summary')
    .select('source_name, total_payout:total_expected')

  if (error) {
    console.error('Error loading source aggregates', error)
    return []
  }

  return data as unknown as PortfolioAggregate[]
}

export async function getSourceTrends(): Promise<MonthlyTrend[]> {
  const { data, error } = await supabase
    .from('v_user_monthly_trends')
    .select('month, total_payments, total_payout, user_id')

  if (error) {
    console.error('Error loading monthly trends', error)
    return []
  }

  return data as MonthlyTrend[]
}
