import { createClient } from '@/lib/supabaseClient'

/* ================================
   TYPE DEFINITIONS
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
  source_id: string
  name: string
  total_earned: number
  payout_count: number
  percent_of_total: number | null
  last_payment_date: string | null
}

export interface MonthlyTrend {
  month: string
  total_payments: number
  total_payout: number
  user_id: string
}

export interface RecentPayout {
  id: string
  user_id: string
  user_email: string
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

export interface AdminUserOverview {
  user_id: string
  email: string
  role: string | null
  joined_date: string
  lifetime_earned: number
  total_sources: number
  total_payouts: number
  last_payout_date: string | null
}

export interface EarningsBySource {
  source_id: string
  name: string
  total_earned: number
  payout_count: number
  percent_of_total: number | null
  last_payment_date: string | null
}

/* ================================
   ADMIN SUMMARY
================================ */

export async function getAdminGlobalSummary(): Promise<AdminSummary | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_global_summary')
    .select('*')
    .maybeSingle()

  if (error || !data) return null
  return data as AdminSummary
}

/* ================================
   GLOBAL PORTFOLIO AGGREGATES
================================ */

export async function getAdminPortfolioAggregates(): Promise<PortfolioAggregate[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_earnings_by_source')
    .select('*')
    .order('total_earned', { ascending: false })

  if (error || !data) return []
  return data
}

/* ================================
   USER-SPECIFIC PORTFOLIO AGGREGATES
================================ */

export async function getAdminPortfolioAggregatesByUser(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('income_sources')
    .select(`
      id,
      source_name,
      payouts (
        amount,
        payment_date
      )
    `)
    .eq('user_id', userId)

  if (error || !data) return []

  return data.map(src => ({
    id: src.id,
    source_name: src.source_name,
    payout_count: src.payouts?.length ?? 0,
    total_earned:
      src.payouts?.reduce(
        (sum: number, p: any) => sum + Number(p.amount || 0),
        0
      ) ?? 0
  }))
}

/* ================================
   MONTHLY TRENDS
================================ */

export async function getAdminMonthlyTrends(): Promise<MonthlyTrend[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_monthly_trends')
    .select('*')

  return error || !data ? [] : data
}

/* ================================
   RECENT PAYOUTS
================================ */

export async function getAdminRecentPayouts(): Promise<RecentPayout[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_recent_payouts')
    .select('*')
    .order('payout_date', { ascending: false })

  return error || !data ? [] : data
}

/* ================================
   ALL USERS (base table)
================================ */

export async function getAllUsers(): Promise<AppUser[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('created_at', { ascending: false })

  return error || !data ? [] : data
}

/* ================================
   EARNINGS BY SOURCE
================================ */

export async function getAdminEarningsBySource(): Promise<EarningsBySource[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_earnings_by_source')
    .select('*')

  return error || !data ? [] : data
}

/* ================================
   ADMIN USER LIST VIEW
================================ */

export async function getAdminUserOverview(): Promise<AdminUserOverview[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_user_overview')
    .select('*')
    .order('lifetime_earned', { ascending: false })

  return error || !data ? [] : data
}

/* ================================
   USER PORTFOLIO
================================ */

export async function getUserPortfolio(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('income_sources')
    .select(`
      id,
      source_name,
      payouts (
        amount,
        payment_date,
        status
      )
    `)
    .eq('user_id', userId)

  return error || !data ? [] : data
}

/* ================================
   USER PAYOUT LEDGER
================================ */

export async function getUserPayoutLedger(userId: string) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('payouts')
    .select(`
      id,
      amount,
      payment_date,
      status,
      notes,
      source_id,
      income_sources ( source_name )
    `)
    .eq('user_id', userId)
    .order('payment_date', { ascending: false })

  return error || !data ? [] : data
}
