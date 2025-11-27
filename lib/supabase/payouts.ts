"use server";

import { createClient } from "@/lib/supabase/server";
import type { Payout } from "@/lib/types";

export async function getPayouts(userId: string): Promise<Payout[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("payouts")
    .select(
      `
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
    `
    )
    .eq("user_id", userId)
    .order("payment_date", { ascending: false });

  if (error) {
    console.error("getPayouts error:", error);
    return [];
  }

  return (data || []).map((p: any) => ({
    id: p.id,
    user_id: p.user_id,
    source_id: p.source_id,
    amount: p.amount,
    payment_date: p.payment_date,
    status: p.status,
    notes: p.notes ?? null,
    created_at: p.created_at,
    // FIXED: Supabase returns an object, not an array
    source_name: p.income_sources?.source_name ?? null
  }));
}
