/* ============================================================
   GLOBAL TYPE DEFINITIONS — HAVEN ONE WEALTH
   ============================================================ */

/* ------------------------------------------------------------
   ADMIN — DASHBOARD TYPES
   ------------------------------------------------------------ */

export interface AdminSummary {
   total_sources: number
   total_payouts: number
   total_payout_amount: number
   avg_payout_amount: number
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


/* ------------------------------------------------------------
   PAYOUT TYPES (USED IN USER DASHBOARD)
   ------------------------------------------------------------ */

/* WITH FIXES:
   - Added source_id (required for editing payouts)
   - Added notes
   - payout_date normalized for client use
*/
export interface RecentPayout {
   id: string
   source_id: string
   user_id?: string

   source_name: string
   amount: number
   status: string

   payout_date: string   // normalized from payment_date
   notes?: string | null
}


/* ------------------------------------------------------------
   INCOME SOURCE TYPES
   ------------------------------------------------------------ */

export interface IncomeSource {
   id?: string
   user_id: string

   source_name: string
   source_type: string | null

   frequency: string | null
   expected_amount: number | null
   expected_monthly: number | null

   notes?: string | null

   archived: boolean
   archived_at: string | null

   deleted: boolean
   deleted_at: string | null

   created_at: string
   ready_for_delete: boolean
}


/* ------------------------------------------------------------
   FULL PAYOUT OBJECT (RAW FROM SUPABASE)
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
   USER (FOR ADMIN PANEL)
   ------------------------------------------------------------ */

export interface AppUser {
   id: string
   email: string
   role?: string
   created_at: string
}
