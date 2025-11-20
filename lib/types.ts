export interface IncomeSource {
   id: string
   user_id: string

   source_name: string
   source_type: string | null
   frequency: string | null
   expected_amount: number | null
   expected_monthly: number | null
   notes: string | null

   archived_at: string | null

   deleted: boolean
   deleted_at: string | null
   ready_for_delete: boolean

   created_at: string
}

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
