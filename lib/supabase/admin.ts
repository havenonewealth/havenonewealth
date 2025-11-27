import { createClient } from '@/lib/supabaseClient'

/* ================================
   TYPE DEFINITIONS (EXPORTED)
================================ */

export interface AdminSummary {
  user_id: string

  total_sources: number
  total_payouts: number
  total_payout_amount: number
  avg_payout_amount: number

  total_expected_monthly: number
  total_expected_annual: number
  payouts_this_month: number
  payouts_last_month: number
  month_over_month_growth: number
  top_source_name: string
  top_source_amount: number
  new_users_this_month: number
  active_users: number
}

export interface PortfolioAggregate {
  source_name: string
  total_expected: number
}

export interface MonthlyTrend {
  month: string
  total_payments: number
  total_payout: number
  user_id: string
}

/* MUST MATCH /lib/types.ts EXACTLY */
export interface RecentPayout {
  id: string
  user_id: string
  source_id: string
  source_name: string
  amount: number
  status: string
  payout_date: string
  notes: string | null
}

export interface AppUser {
  id: string
  email: string
  role?: string
  created_at: string
}

/* ================================
   ADMIN QUERY FUNCTIONS
================================ */

export async function getAdminGlobalSummary(): Promise<AdminSummary | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_global_summary')
    .select('*')
    .single()

  if (error) return null
  return data as AdminSummary
}

export async function getAdminPortfolioAggregates(): Promise<PortfolioAggregate[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_portfolio_aggregates')
    .select('*')

  return error ? [] : (data as PortfolioAggregate[])
}

export async function getAdminMonthlyTrends(): Promise<MonthlyTrend[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_monthly_trends')
    .select('*')

  return error ? [] : (data as MonthlyTrend[])
}

/* ============================================================
   FIXED: Converts admin payouts to match global RecentPayout
============================================================ */
export async function getAdminRecentPayouts(): Promise<RecentPayout[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_recent_payouts')
    .select(`
      id,
      user_id,
      source_id,
      amount,
      status,
      payout_date,
      notes,
      income_sources ( source_name )
    `)
    .order('payout_date', { ascending: false })

  if (error || !data) return []

  return data.map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    source_id: p.source_id,
    amount: Number(p.amount),
    status: p.status,
    payout_date: p.payout_date,
    notes: p.notes ?? null,
    source_name: p.income_sources?.source_name ?? ""
  })) as RecentPayout[]
}

export async function getAllUsers(): Promise<AppUser[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')

  return error ? [] : (data as AppUser[])
}
