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

/* ============================================
   PortfolioAggregate - MUST match the view
   v_admin_earnings_by_source
============================================ */

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

/* MUST MATCH /lib/types.ts EXACTLY */
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

/* ============================================
   ADMIN USER OVERVIEW (FINAL + CORRECT)
   matches v_admin_user_overview SQL View
============================================ */

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

/* ============================================
   Earnings By Source (Admin analytics)
============================================ */

export interface EarningsBySource {
  source_id: string
  name: string
  total_earned: number
  payout_count: number
  percent_of_total: number | null
  last_payment_date: string | null
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
    .from('v_admin_earnings_by_source')
    .select('*')
    .order('total_earned', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function getAdminMonthlyTrends(): Promise<MonthlyTrend[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_monthly_trends')
    .select('*')

  return error ? [] : (data as MonthlyTrend[])
}

/* ============================================================
   FIXED: return recent payouts in correct unified structure
============================================================ */

export async function getAdminRecentPayouts(): Promise<RecentPayout[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_recent_payouts')
    .select('*')
    .order('payout_date', { ascending: false })

  if (error || !data) return []
  return data as RecentPayout[]
}

/* ================================
   USER LIST
================================ */

export async function getAllUsers(): Promise<AppUser[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')

  return error ? [] : (data as AppUser[])
}

/* =======================================
   Earnings By Source
======================================= */

export async function getAdminEarningsBySource(): Promise<EarningsBySource[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_earnings_by_source')
    .select('*')

  if (error || !data) return []
  return data as EarningsBySource[]
}

/* =======================================
   Admin User Overview
======================================= */

export async function getAdminUserOverview(): Promise<AdminUserOverview[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('v_admin_user_overview')
    .select('*')
    .order('lifetime_earned', { ascending: false })

  if (error || !data) return []
  return data as AdminUserOverview[]
}
