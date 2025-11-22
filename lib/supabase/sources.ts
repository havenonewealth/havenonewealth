"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ---------------------------------------------------------
// ACTIVE SOURCES
// ---------------------------------------------------------
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .eq("deleted", false)

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ---------------------------------------------------------
// ARCHIVED SOURCES
// ---------------------------------------------------------
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", true)
    .eq("deleted", false)

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ---------------------------------------------------------
// SAVE SOURCE (CREATE / UPDATE) — FIXED
// ---------------------------------------------------------
export async function saveSource(id: string | null, payload: Partial<IncomeSource>) {

  // Build ONLY the fields that the user actually edits
  const safePayload: any = {}

  if (payload.source_name !== undefined) safePayload.source_name = payload.source_name
  if (payload.source_type !== undefined) safePayload.source_type = payload.source_type
  if (payload.frequency !== undefined) safePayload.frequency = payload.frequency
  if (payload.expected_amount !== undefined) safePayload.expected_amount = payload.expected_amount
  if (payload.expected_monthly !== undefined) safePayload.expected_monthly = payload.expected_monthly
  if (payload.notes !== undefined) safePayload.notes = payload.notes
  if (payload.user_id) safePayload.user_id = payload.user_id

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

// ---------------------------------------------------------
// ARCHIVE SOURCE — WORKING
// ---------------------------------------------------------
export async function archiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ---------------------------------------------------------
// UNARCHIVE SOURCE — WORKING
// ---------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null
    })
    .eq("id", id)

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}
