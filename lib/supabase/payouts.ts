"use server"

import { supabase } from "@/lib/supabaseClient"
import type { Payout } from "@/lib/types"

// ---------------------------------------------------------
// Fetch payouts with source name joined
// ---------------------------------------------------------
export async function getPayouts(userId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from("payouts")
    .select(`
        id,
        user_id,
        source_id,
        amount,
        payment_date,
        status,
        notes,
        created_at,
        income_sources (
          source_name
        )
    `)
    .eq("user_id", userId)
    .order("payment_date", { ascending: false })

  if (error) {
    console.error("getPayouts error:", error)
    return []
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    source_id: p.source_id,
    amount: p.amount,
    payment_date: p.payment_date,            // real column
    status: p.status,
    notes: p.notes ?? null,
    created_at: p.created_at,
    income_sources: p.income_sources
      ? { source_name: p.income_sources.source_name ?? undefined }
      : null
  }))
}
