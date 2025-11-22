"use server"

import { supabase } from "@/lib/supabaseClient"
import type { IncomeSource } from "@/lib/types"

// ACTIVE SOURCES
export async function getActiveSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .is("archived_at", null)
    .eq("deleted", false)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("getActiveSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// ARCHIVED SOURCES
export async function getArchivedSources(userId: string): Promise<IncomeSource[]> {
  const { data, error } = await supabase
    .from("income_sources")
    .select("*")
    .eq("user_id", userId)
    .not("archived_at", "is", null)
    .eq("deleted", false)
    .order("archived_at", { ascending: false })

  if (error) {
    console.error("getArchivedSources error:", error)
    return []
  }

  return data as IncomeSource[]
}

// SAVE SOURCE
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

// ARCHIVE SOURCE — FIXED 100%
export async function archiveSource(id: string) {
  console.log("SERVER: archiveSource CALLED with ID:", id)

  const { data, error } = await supabase
    .from("income_sources")
    .update({
      archived: true,
      archived_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()

  if (error) {
    console.error("SERVER: archiveSource ERROR:", error)
    throw new Error(error.message)
  }

  console.log("SERVER: archiveSource SUCCESS. Return data:", data)
  return data
}


// UNARCHIVE SOURCE — FIXED 100%
export async function unarchiveSource(id: string) {
  const { error } = await supabase
    .from("income_sources")
    .update({
      archived_at: null
    })
    .eq("id", id)

  if (error) {
    console.error("unarchiveSource error:", error)
    throw new Error(error.message)
  }

  return true
}
