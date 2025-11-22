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
// SAVE SOURCE
// ---------------------------------------------------------
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

// ---------------------------------------------------------
// ARCHIVE SOURCE — FIXED & VERIFIED
// ---------------------------------------------------------
export async function archiveSource(id: string) {
  console.log("ARCHIVE: Calling Supabase update with id =", id)

  const { data, error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()

  console.log("ARCHIVE: result from supabase =", data, error)

  if (error) {
    console.error("archiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}

// ---------------------------------------------------------
// UNARCHIVE SOURCE — FIXED
// ---------------------------------------------------------
export async function unarchiveSource(id: string) {
  const { data, error } = await supabase
    .from("income_sources")
    .update({
      archived: false,
      archived_at: null
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}
