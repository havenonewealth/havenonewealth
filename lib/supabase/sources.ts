"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// Fetch active sources
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  return data ?? []
}

// Fetch archived sources
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .eq("deleted", false)
    .order("archived_at", { ascending: false })

  return data ?? []
}

// Save or update source
export async function saveSource(payload: any) {
  if (payload.id) {
    await supabase
      .from("income_sources")
      .update(payload)
      .eq("id", payload.id)
  } else {
    await supabase.from("income_sources").insert(payload)
  }

  return true
}

// Archive
export async function archiveSource(id: string) {
  await supabase
    .from("income_sources")
    .update({
      archived_at: new Date().toISOString(),
      archived: true,
      deleted: false
    })
    .eq("id", id)
}

// Unarchive
export async function unarchiveSource(id: string) {
  await supabase
    .from("income_sources")
    .update({
      archived_at: null,
      archived: false,
      deleted: false
    })
    .eq("id", id)
}
