"use server"

import { supabase } from "@/lib/supabaseClient"
import { IncomeSource } from "@/lib/types"

export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  return data || []
}

export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)
    .order("archived_at", { ascending: false })

  return data || []
}
