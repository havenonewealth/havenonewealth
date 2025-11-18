import { supabase } from '@/lib/supabaseClient'
import type { Payout } from '@/lib/types'

// Explicitly export Payout so TS stops complaining
export type { Payout }

export async function getPayouts(): Promise<Payout[]> {
  const { data, error } = await supabase
    .from('payouts_view') // ensure this is your view/table
    .select('*')
    .order('payout_date', { ascending: false })

  if (error) {
    console.error('Error loading payouts', error)
    return []
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    source_id: p.source_id,
    source_name: p.source_name || null,
    amount: p.amount,
    payout_date: p.payout_date,
    status: p.status,
    notes: p.notes || null,
    created_at: p.created_at
  })) as Payout[]
}
