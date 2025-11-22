"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ------------------------------
// ACTIVE SOURCES (fixed)
// ------------------------------
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)
    .order("id", { ascending: false })   // FIXED ORDER

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data ?? []
}

// ------------------------------
// ARCHIVED SOURCES (fixed)
// ------------------------------
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)
    .order("id", { ascending: false })   // FIXED ORDER

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data ?? []
}

// ------------------------------
// SAVE
// ------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {
  const safePayload = {
    source_name: payload.source_name,
    source_type: payload.source_type ?? null,
    frequency: payload.frequency ?? null,
    expected_amount: payload.expected_amount ?? null,
    expected_monthly: payload.expected_monthly ?? null,
    notes: payload.notes ?? null,
    user_id: payload.user_id
  }

  if (id) {
    const { error } = await supabase
      .from("income_sources")
      .update(safePayload)
      .eq("id", id)

    if (error) {
      console.error("saveSource update error:", error)
      return false
    }

    return true
  }

  const { error } = await supabase
    .from("income_sources")
    .insert(safePayload)

  if (error) {
    console.error("saveSource create error:", error)
    return false
  }

  return true
}

// ------------------------------
// ARCHIVE (verified working)
// ------------------------------
export async function archiveSource(id: string) {
  console.log("ARCHIVING", id)

  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ------------------------------
// UNARCHIVE (verified working)
// ------------------------------
export async function unarchiveSource(id: string) {
  console.log("UNARCHIVING", id)

  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null,
    })
    .eq("id", id)

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}
