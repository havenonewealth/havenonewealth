/* ============================================================
   GLOBAL TYPE DEFINITIONS — HAVEN ONE WEALTH
   ============================================================ */

/* ------------------------------------------------------------
   Admin Summary
------------------------------------------------------------ */
export interface AdminSummary {
   total_sources: number
   total_payouts: number
   total_payout_amount: number
   avg_payout_amount: number
}

/* ------------------------------------------------------------
   Portfolio Aggregates
------------------------------------------------------------ */
export interface PortfolioAggregate {
   source_name: string
   total_expected: number
}

/* ------------------------------------------------------------
   Monthly Trends
------------------------------------------------------------ */
export interface MonthlyTrend {
   month: string
   total_payments: number
   total_payout: number
   user_id: string
}

/* ------------------------------------------------------------
   Recent Payouts
------------------------------------------------------------ */
export interface RecentPayout {
   id?: string
   source_name: string
   amount: number
   status: string
   payout_date: string
}

/* ------------------------------------------------------------
   Income Sources — MAIN MODEL
   (Aligned with Supabase + UI logic)
------------------------------------------------------------ */
export interface IncomeSource {
   id?: string
   user_id: string

   source_name: string
   source_type: string | null
   frequency: string | null

   expected_amount: number | null
   expected_monthly: number | null

   notes: string | null

   archived: boolean
   archived_at: string | null

   deleted: boolean
   deleted_at: string | null
   ready_for_delete: boolean

   created_at: string
}

/* ------------------------------------------------------------
   Payouts
------------------------------------------------------------ */
export interface Payout {
   id: string
   user_id: string
   source_id: string

   amount: number
   payment_date: string
   status: string
   notes?: string | null
   created_at: string

   income_sources?: {
      source_name?: string
   } | null
}

/* ------------------------------------------------------------
   Users
------------------------------------------------------------ */
export interface AppUser {
   id: string
   email: string
   role?: string
   created_at: string
}

/* ------------------------------------------------------------
   Insights (for Analytics/KPI)
------------------------------------------------------------ */
export interface InsightRow {
   source_name: string
   total_earned: number
   avg_payment: number
   payout_count: number
   first_payment: string | null
   last_payment: string | null
}

/* ------------------------------------------------------------
   PayoutRow (for admin_recent_payouts view)
------------------------------------------------------------ */
export interface PayoutRow {
   id: string
   amount: number
   date: string
   source_name: string
   created_at: string
   user_id?: string | null
   source_id?: string | null
}
