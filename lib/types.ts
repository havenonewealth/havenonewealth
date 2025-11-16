export interface IncomeSource {
  id: string
  user_id: string
  source_name: string
  expected_amount?: number
}
export interface Payout {
  id: string
  amount: number
  payment_date: string
  status: string
  source_id: string
  income_sources?: { source_name?: string, user_id?: string }
}
