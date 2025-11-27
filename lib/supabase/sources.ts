"use server"

import { createClient } from "@/lib/supabase/server"
import type { IncomeSource } from "@/lib/types"

export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data || []
}

export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)
    .order("archived_at", { ascending: false })

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data || []
}
