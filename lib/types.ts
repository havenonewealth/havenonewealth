/* ============================================================
   GLOBAL TYPE DEFINITIONS — HAVEN ONE WEALTH
   ============================================================ */

/* Admin Summary */
export interface AdminSummary {
   total_sources: number
   total_payouts: number
   total_payout_amount: number
   avg_payout_amount: number
}

/* Portfolio Aggregates */
export interface PortfolioAggregate {
   source_name: string
   total_expected: number
}

/* Monthly Trends */
export interface MonthlyTrend {
   month: string
   total_payments: number
   total_payout: number
   user_id: string
}

/* Recent Payouts */
export interface RecentPayout {
   id?: string
   source_id?: string
   user_id?: string
   source_name: string
   amount: number
   status: string
   payout_date: string  // normalized from payment_date
}

/* Income Sources */
export interface IncomeSource {
   id?: string
   user_id: string
   source_name: string
   source_type: string | null
   frequency: string | null
   expected_amount: number | null
   expected_monthly: number | null

   // IMPORTANT FIX:
   notes: string | null | undefined

   archived: boolean
   archived_at: string | null
   deleted: boolean
   deleted_at: string | null
   created_at: string
   ready_for_delete: boolean
}

/* Payouts */
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

/* Users */
export interface AppUser {
   id: string
   email: string
   role?: string
   created_at: string
}
