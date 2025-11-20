"use server"

import { supabase } from "@/lib/supabaseClient"
import type { Payout } from "@/lib/types"

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

  return (data || []).map((p: any) => {
    const src =
      Array.isArray(p.income_sources) && p.income_sources.length > 0
        ? p.income_sources[0].source_name
        : null

    return {
      id: p.id,
      user_id: p.user_id,
      source_id: p.source_id,
      amount: p.amount,
      payment_date: p.payment_date,
      status: p.status,
      notes: p.notes ?? null,
      created_at: p.created_at,
      income_sources: src ? { source_name: src } : null
    }
  })
}
